import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import AdminTopbar from "@/components/AdminTopbar";
import Link from "next/link";
import {
  IconReport,
  IconFileClock,
  IconRefresh,
  IconCheckCircle,
  IconFilter,
  IconDownload,
  IconAlertTriangle,
} from "@/components/icons";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

async function getDashboardData() {
  const supabase = createClient();

  const [{ count: total }, { count: baru }, { count: proses }, { count: selesai }] =
    await Promise.all([
      supabase.from("complaints").select("*", { count: "exact", head: true }),
      supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "baru"),
      supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "diproses"),
      supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "selesai"),
    ]);

  const { data: recent } = await supabase
    .from("complaints")
    .select("id, complaint_number, title, category, status, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: categoryRows } = await supabase
    .from("complaints")
    .select("category");

  const categoryCount: Record<string, number> = {};
  (categoryRows ?? []).forEach((r) => {
    categoryCount[r.category] = (categoryCount[r.category] ?? 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const totalForPct = (total ?? 0) || 1;

  // Tren laporan 7 hari terakhir
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: weekRows } = await supabase
    .from("complaints")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    return { date: d, label: DAY_LABELS[d.getDay()], count: 0 };
  });
  (weekRows ?? []).forEach((r) => {
    const d = new Date(r.created_at);
    const idx = weeklyTrend.findIndex(
      (w) => w.date.toDateString() === d.toDateString()
    );
    if (idx >= 0) weeklyTrend[idx].count += 1;
  });
  const maxTrend = Math.max(...weeklyTrend.map((w) => w.count), 1);

  // Laporan darurat = status "baru" yang belum ditangani
  const { count: urgentCount } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true })
    .eq("status", "baru");

  // Pertumbuhan: total minggu ini vs minggu lalu
  const startThisWeek = new Date();
  startThisWeek.setDate(startThisWeek.getDate() - 6);
  startThisWeek.setHours(0, 0, 0, 0);

  const startLastWeek = new Date(startThisWeek);
  startLastWeek.setDate(startLastWeek.getDate() - 7);
  const endLastWeek = new Date(startThisWeek);
  endLastWeek.setMilliseconds(-1);

  const [{ count: countThisWeek }, { count: countLastWeek }] = await Promise.all([
    supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startThisWeek.toISOString()),
    supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startLastWeek.toISOString())
      .lte("created_at", endLastWeek.toISOString()),
  ]);

  let growthPct: number | null = null;
  if (countLastWeek && countLastWeek > 0) {
    growthPct = Math.round(
      (((countThisWeek ?? 0) - countLastWeek) / countLastWeek) * 100
    );
  } else if ((countThisWeek ?? 0) > 0) {
    growthPct = 100;
  }

  return {
    total: total ?? 0,
    baru: baru ?? 0,
    proses: proses ?? 0,
    selesai: selesai ?? 0,
    recent: recent ?? [],
    topCategories,
    totalForPct,
    weeklyTrend,
    maxTrend,
    urgentCount: urgentCount ?? 0,
    growthPct,
  };
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  let adminName = userData.user?.email?.split("@")[0] ?? "Admin Desa";
  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (profile?.full_name) adminName = profile.full_name;
  }

  const data = await getDashboardData();

  const growthLabel =
    data.growthPct === null
      ? "Baru"
      : `${data.growthPct > 0 ? "+" : ""}${data.growthPct}%`;
  const growthColor =
    data.growthPct === null || data.growthPct >= 0
      ? "text-green-600"
      : "text-red-600";

  const cards = [
    {
      label: "Total Laporan",
      value: data.total,
      icon: IconReport,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-700",
      tag: growthLabel,
      tagColor: growthColor,
    },
    {
      label: "Laporan Masuk",
      value: data.baru,
      icon: IconFileClock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      tag: "Baru",
      tagColor: "text-amber-600",
    },
    {
      label: "Sedang Ditangani",
      value: data.proses,
      icon: IconRefresh,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      tag: "Proses",
      tagColor: "text-blue-600",
    },
    {
      label: "Laporan Selesai",
      value: data.selesai,
      icon: IconCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      tag: "Selesai",
      tagColor: "text-emerald-600",
    },
  ];

  return (
    <div>
      <AdminTopbar
        title="Ringkasan Dashboard"
        adminName={adminName}
        notificationCount={data.urgentCount}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5">
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg} ${c.iconColor}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className={`text-xs font-medium ${c.tagColor}`}>
                  {c.tag}
                </span>
              </div>
              <p className="mt-4 text-xs text-gray-500">{c.label}</p>
              <p className="mt-1 text-2xl font-medium text-gray-900">
                {c.value.toLocaleString("id-ID")}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-navy-800">Tren Laporan Mingguan</h2>
            <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
              7 Hari Terakhir
            </span>
          </div>

          <div className="mt-8 flex h-48 items-end justify-between gap-3 px-2">
            {data.weeklyTrend.map((w, i) => {
              const heightPct = Math.max((w.count / data.maxTrend) * 100, 4);
              const isMax = w.count === data.maxTrend && w.count > 0;
              return (
                <div
                  key={i}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className={`w-full max-w-[36px] rounded-t-md ${
                      isMax ? "bg-navy-700" : "bg-navy-100"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${w.count} laporan`}
                  />
                  <span className="text-xs text-gray-500">{w.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card flex flex-col p-6">
          <h2 className="font-medium text-navy-800">Kategori Terpopuler</h2>
          <div className="mt-4 space-y-4">
            {data.topCategories.map(([name, count]) => {
              const pct = Math.round((count / data.totalForPct) * 100);
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{name}</span>
                    <span className="font-medium text-gray-500">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-navy-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.topCategories.length === 0 && (
              <p className="text-sm text-gray-400">Belum ada data.</p>
            )}
          </div>

          {data.urgentCount > 0 && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <IconAlertTriangle className="h-3.5 w-3.5" />
                Butuh Tindakan Segera
              </p>
              <p className="mt-1.5 text-base font-medium text-gray-900">
                {data.urgentCount} Laporan Belum Ditinjau
              </p>
              <Link
                href="/admin/pengaduan?status=baru"
                className="mt-3 block rounded-lg bg-navy-800 py-2.5 text-center text-sm font-medium text-white hover:bg-navy-900"
              >
                Lihat Semua
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-navy-800">Laporan Terbaru</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Update data real-time dari masyarakat
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/pengaduan"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <IconFilter className="h-3.5 w-3.5" />
              Filter
            </Link>
            <Link
              href="/api/laporan/spreadsheet"
              className="flex items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-2 text-sm font-medium text-white hover:bg-navy-900"
            >
              <IconDownload className="h-3.5 w-3.5" />
              Eksport CSV
            </Link>
          </div>
        </div>

        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
              <th className="py-2">ID Laporan</th>
              <th className="py-2">Tanggal</th>
              <th className="py-2">Kategori</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.map((r) => (
              <tr key={r.id} className="border-b border-gray-50">
                <td className="py-3 font-medium text-gray-800">
                  {r.complaint_number}
                </td>
                <td className="py-3 text-gray-500">
                  {formatDate(r.created_at)}
                </td>
                <td className="py-3 text-gray-600">{r.category}</td>
                <td className="py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/pengaduan/${r.id}`}
                    className="text-sky-700 hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
            {data.recent.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  Belum ada laporan masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
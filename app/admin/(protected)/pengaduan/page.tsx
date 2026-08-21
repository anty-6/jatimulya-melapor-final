import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import PhotoPreview from "@/components/PhotoPreview";
import { formatDate, displayReporterName } from "@/lib/format";
import { ComplaintStatus } from "@/types/database";

const STATUS_OPTIONS: { value: ComplaintStatus | ""; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "baru", label: "Baru" },
  { value: "diverifikasi", label: "Terverifikasi" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "ditolak", label: "Ditolak" },
];

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    status?: string;
    kategori?: string;
    page?: string;
  };
}) {
  const supabase = createClient();
  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = 10;

  let query = supabase
    .from("complaints")
    .select(
      "id, complaint_number, title, category, status, created_at, is_anonymous, reporter_name, photo_urls",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (searchParams.q) {
    query = query.or(
      `complaint_number.ilike.%${searchParams.q}%,title.ilike.%${searchParams.q}%`
    );
  }
  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.kategori) {
    query = query.eq("category", searchParams.kategori);
  }

  const { data: complaints, count } = await query;
  const { data: categories } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-navy-800">
            Daftar Pengaduan
          </h1>
          <p className="text-sm text-gray-500">
            Kelola dan tinjau semua aspirasi masyarakat secara transparan.
          </p>
        </div>
        <Link href="/admin/laporan" className="btn-primary text-sm">
          Buat Laporan
        </Link>
      </div>

      <form className="card mt-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-4">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="ID Laporan atau judul..."
          className="input-field sm:col-span-2"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="input-field"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          name="kategori"
          defaultValue={searchParams.kategori ?? ""}
          className="input-field"
        >
          <option value="">Semua Kategori</option>
          {(categories ?? []).map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn-outline sm:col-span-4" type="submit">
          Terapkan Filter
        </button>
      </form>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-5 py-3">ID Laporan</th>
              <th className="px-5 py-3">Foto</th>
              <th className="px-5 py-3">Tanggal</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="px-5 py-3">Nama Pelapor</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(complaints ?? []).map((c) => (
              <tr key={c.id} className="border-b border-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">
                  {c.complaint_number}
                </td>
                <td className="px-5 py-3">
                  {c.photo_urls?.length > 0 ? (
                    <PhotoPreview urls={c.photo_urls} />
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-5 py-3 text-gray-600">{c.category}</td>
                <td className="px-5 py-3 text-gray-600">
                  {displayReporterName(c)}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/pengaduan/${c.id}`}
                    className="text-sky-700 hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
            {(complaints ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  Tidak ada laporan yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 text-sm text-gray-500">
          <span>
            Menampilkan {(complaints ?? []).length} dari {count ?? 0} data
          </span>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/pengaduan?${new URLSearchParams({
                  ...searchParams,
                  page: String(p),
                } as any).toString()}`}
                className={`rounded-md px-3 py-1 ${
                  p === page
                    ? "bg-navy-800 text-white"
                    : "border border-gray-200 text-gray-600"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

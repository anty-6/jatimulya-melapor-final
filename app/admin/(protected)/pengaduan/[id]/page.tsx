import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import UpdateStatusPanel from "@/components/UpdateStatusPanel";
import { formatDate, maskNik, displayReporterName } from "@/lib/format";
import { IconArrowLeft, IconMapPin } from "@/components/icons";

export default async function AdminComplaintDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: complaint } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!complaint) notFound();

  const { data: history } = await supabase
    .from("status_history")
    .select("*")
    .eq("complaint_id", complaint.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link
        href="/admin/pengaduan"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-700"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke daftar laporan
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-xl font-medium text-navy-800">
          Kelola Detail Pengaduan
        </h1>
        <a
          href={`/api/laporan/pdf?id=${complaint.id}`}
          target="_blank"
          className="btn-outline text-sm"
        >
          Cetak
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={complaint.status} />
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                ID Laporan #{complaint.complaint_number}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-medium text-navy-800">
              {complaint.title}
            </h2>
            <p className="text-sm text-gray-500">
              Dibuat pada: {formatDate(complaint.created_at, true)}
            </p>
            <p className="mt-4 whitespace-pre-line text-sm text-gray-700">
              {complaint.description}
            </p>

            {complaint.photo_urls?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {complaint.photo_urls.map((url: string, i: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Bukti ${i + 1}`}
                    className="h-32 w-44 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-medium text-navy-800">
              Informasi Pelapor
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-gray-400">
                  Nama Lengkap
                </p>
                <p className="font-medium text-gray-800">
                  {displayReporterName(complaint)}
                </p>
                {!complaint.is_anonymous && complaint.is_reporter_verified && (
                  <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                    Warga Terverifikasi
                  </span>
                )}
              </div>
              {!complaint.is_anonymous && (
                <div className="text-right text-sm">
                  <p className="text-xs uppercase text-gray-400">NIK</p>
                  <p>{maskNik(complaint.reporter_nik)}</p>
                  <p className="mt-2 text-xs uppercase text-gray-400">
                    No. WhatsApp
                  </p>
                  <p className="text-sky-700">
                    {complaint.reporter_phone || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-medium text-navy-800">Riwayat Status</h3>
            <div className="mt-4 space-y-4">
              {(history ?? []).map((h) => (
                <div key={h.id}>
                  <p className="text-sm font-medium text-gray-800">
                    Status diubah ke: {h.status.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(h.created_at, true)}
                    {h.changed_by ? ` oleh ${h.changed_by}` : ""}
                  </p>
                  {h.note && (
                    <p className="mt-1 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                      &ldquo;{h.note}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <UpdateStatusPanel complaint={complaint} />

          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-medium text-navy-800">
              <IconMapPin className="h-4 w-4" />
              Lokasi Kejadian
            </h3>
            <p className="mt-2 text-sm font-medium text-gray-800">
              {complaint.location}
            </p>
            {complaint.latitude && complaint.longitude && (
              <a
                className="mt-2 inline-block text-sm text-sky-700 hover:underline"
                target="_blank"
                href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
              >
                Buka di Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

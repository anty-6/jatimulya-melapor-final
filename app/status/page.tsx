import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatDate, displayReporterName } from "@/lib/format";
import { ComplaintStatus } from "@/types/database";
import { IconCheckCircle, IconClock } from "@/components/icons";
import Image from "next/image";

const STEPS: { key: ComplaintStatus; label: string }[] = [
  { key: "baru", label: "Laporan Masuk" },
  { key: "diverifikasi", label: "Verifikasi" },
  { key: "diproses", label: "Tindak Lanjut" },
  { key: "selesai", label: "Selesai" },
];

function stepIndex(status: ComplaintStatus) {
  if (status === "ditolak") return -1;
  return STEPS.findIndex((s) => s.key === status);
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: { nomor?: string; baru?: string };
}) {
  const supabase = createClient();
  const nomor = searchParams.nomor?.trim();

  let complaint = null;
  let history: any[] = [];
  let notFound = false;

  if (nomor) {
    const { data } = await supabase
      .from("complaints")
      .select("*")
      .eq("complaint_number", nomor)
      .maybeSingle();

    if (!data) {
      notFound = true;
    } else {
      complaint = data;
      const { data: historyData } = await supabase
        .from("status_history")
        .select("*")
        .eq("complaint_id", data.id)
        .order("created_at", { ascending: false });
      history = historyData ?? [];
    }
  }

  const currentStep = complaint ? stepIndex(complaint.status) : -1;

  return (
    <div>
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-medium text-navy-800">
          Cek Status Pengaduan
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Masukkan nomor pengaduan Anda untuk melihat perkembangan laporan.
        </p>

        {searchParams.baru && (
          <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            Laporan berhasil dikirim. Simpan nomor pengaduan{" "}
            <strong>{nomor}</strong> untuk memantau perkembangannya.
          </div>
        )}

        <form action="/status" className="mt-6 flex gap-3">
          <input
            name="nomor"
            defaultValue={nomor}
            placeholder="Contoh: LP-2026-0001"
            className="input-field"
          />
          <button className="btn-primary whitespace-nowrap" type="submit">
            Cari
          </button>
        </form>

        {notFound && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Nomor pengaduan tidak ditemukan. Periksa kembali penulisan nomor
            Anda.
          </p>
        )}

        {complaint && (
          <div className="mt-8 space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-gray-500">
                  Status Saat Ini
                </p>
                <p className="text-xs text-gray-400">
                  Update terakhir: {formatDate(complaint.updated_at, true)}
                </p>
              </div>
              <div className="mt-2">
                <StatusBadge status={complaint.status} />
              </div>

              {complaint.status === "ditolak" ? (
                <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  Laporan ini ditolak. Silakan lihat catatan admin di bawah
                  untuk informasi lebih lanjut.
                </p>
              ) : (
                <div className="mt-8 flex items-center">
                  {STEPS.map((step, idx) => (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            idx <= currentStep
                              ? "bg-navy-700 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <IconCheckCircle className="h-4 w-4" />
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-700">
                          {step.label}
                        </p>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`mx-1 h-0.5 flex-1 ${
                            idx < currentStep ? "bg-navy-700" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <p className="text-xs text-gray-500">
                #{complaint.complaint_number}
              </p>
              <h2 className="mt-1 text-lg font-medium text-navy-800">
                {complaint.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {complaint.category} · Dilaporkan oleh{" "}
                {displayReporterName(complaint)}
              </p>
              <p className="mt-4 whitespace-pre-line text-sm text-gray-700">
                {complaint.description}
              </p>

              {complaint.photo_urls?.length > 0 && (
                <div className="mt-4 flex gap-3">
                  {complaint.photo_urls.map((url: string, i: number) => (
                    <div
                      key={i}
                      className="relative h-24 w-32 overflow-hidden rounded-lg bg-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Bukti ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="card p-6">
                <h3 className="font-medium text-navy-800">
                  Riwayat &amp; Respon Admin
                </h3>
                <div className="mt-4 space-y-4">
                  {history.map((h) => (
                    <div key={h.id} className="flex gap-3">
                      <IconClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Status diubah ke: {h.status}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(h.created_at, true)}
                          {h.changed_by ? ` oleh ${h.changed_by}` : ""}
                        </p>
                        {h.note && (
                          <p className="mt-1 text-sm text-gray-600">
                            &ldquo;{h.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

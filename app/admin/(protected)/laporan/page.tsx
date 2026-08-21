import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import LaporanActions from "@/components/LaporanActions";

export default async function AdminLaporanPage() {
  const supabase = createClient();

  const { data: settings } = await supabase
    .from("spreadsheet_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const { data: recent } = await supabase
    .from("complaints")
    .select("id, complaint_number, title, category, status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div>
      <h1 className="text-xl font-medium text-navy-800">Laporan</h1>
      <p className="text-sm text-gray-500">
        Cetak rekapitulasi pengaduan ke PDF, unduh sebagai spreadsheet, atau
        sinkronkan langsung ke Google Sheets.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-5 py-3">ID Laporan</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {r.complaint_number}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{r.category}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-3 text-xs text-gray-400">
            Pratinjau 8 laporan terbaru. Gunakan panel di samping untuk
            mengekspor data berdasarkan rentang tanggal.
          </p>
        </div>

        <LaporanActions hasSpreadsheetConfigured={!!settings} />
      </div>
    </div>
  );
}

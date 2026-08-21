import { createClient } from "@/lib/supabase/server";
import SpreadsheetSettingsForm from "@/components/SpreadsheetSettingsForm";
import { formatDate } from "@/lib/format";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase
    .from("spreadsheet_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-xl font-medium text-navy-800">Pengaturan</h1>
      <p className="text-sm text-gray-500">
        Konfigurasi integrasi sistem, termasuk koneksi Google Spreadsheet.
      </p>

      <div className="mt-6 max-w-xl space-y-4">
        {settings?.last_synced_at && (
          <p className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600">
            Sinkronisasi terakhir: {formatDate(settings.last_synced_at, true)}
          </p>
        )}
        <SpreadsheetSettingsForm settings={settings ?? null} />

        <div className="card p-6 text-sm text-gray-600">
          <p className="font-medium text-navy-800">
            Cara menghubungkan Google Sheets:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Buat Google Sheet baru, lalu salin Spreadsheet ID dari URL.</li>
            <li>
              Bagikan (Share) sheet tersebut sebagai <strong>Editor</strong>{" "}
              ke alamat email Service Account (lihat <code>.env.local</code>{" "}
              variabel <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>).
            </li>
            <li>Simpan Spreadsheet ID di form di atas.</li>
            <li>
              Buka menu <strong>Laporan</strong>, klik &ldquo;Sinkronkan
              Sekarang&rdquo;.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

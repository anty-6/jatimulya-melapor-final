import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let val = trimmed.slice(idx + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  process.env[key] = val;
}

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

async function main() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const sheetName = process.env.GOOGLE_SHEET_NAME ?? "Pengaduan";
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  console.log("🔄 Mengambil data dari Supabase...");
  const { data: complaints, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  console.log(`✅ ${complaints?.length ?? 0} laporan ditemukan`);

  const header = [
    "ID Laporan", "Tanggal", "Kategori", "Judul",
    "Isi Laporan", "Lokasi", "Nama Pelapor", "No. WhatsApp",
    "Status", "Update Terakhir",
  ];

  const rows = (complaints ?? []).map((c) => [
    c.complaint_number,
    formatDate(c.created_at),
    c.category,
    c.title,
    c.description,
    c.location,
    c.is_anonymous ? "Anonim" : c.reporter_name || "-",
    c.is_anonymous ? "-" : c.reporter_phone || "-",
    c.status,
    formatDate(c.updated_at, true),
  ]);

  console.log("🔄 Menyambungkan ke Google Sheets...");
  const auth = new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  const sheets = google.sheets({ version: "v4", auth });

  // Cek apakah sheet tab sudah ada, kalau belum buat baru
  const { data: spreadsheet } = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = spreadsheet.sheets?.map((s) => s.properties?.title) ?? [];
  if (!existingSheets.includes(sheetName)) {
    console.log(`🔄 Sheet "${sheetName}" belum ada, membuat baru...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
    });
  }

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A1:Z10000` });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [header, ...rows] },
  });

  console.log(`✅ Sync selesai! ${rows.length} baris ditulis ke sheet "${sheetName}"`);
  console.log(`🔗 https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

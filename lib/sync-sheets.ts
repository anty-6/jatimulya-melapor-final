import { google } from "googleapis";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Kredensial Google Service Account belum diatur.");
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function syncToSheets() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME ?? "Pengaduan";

  if (!spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID belum diatur.");

  const supabase = createServiceRoleClient();
  const { data: complaints, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Hitung jumlah kolom foto maksimal dari semua data
  const maxPhotos = Math.min(
    Math.max(...(complaints ?? []).map((c) => (c.photo_urls?.length ?? 0)), 0),
    5
  );

  const header = [
    "ID Laporan",
    "Tanggal",
    "Kategori",
    "Judul",
    "Isi Laporan",
    "Lokasi",
    "Nama Pelapor",
    "No. WhatsApp",
    "Status",
    "Update Terakhir",
    ...Array.from({ length: maxPhotos }, (_, i) => `Foto ${i + 1}`),
  ];

  const rows = (complaints ?? []).map((c) => {
    const fotoCols = Array.from({ length: maxPhotos }, (_, i) => {
      const url = c.photo_urls?.[i];
      return url ? `=IMAGE("${url}")` : "";
    });
    return [
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
      ...fotoCols,
    ];
  });

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Auto-create sheet tab jika belum ada
  const { data: spreadsheet } = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = spreadsheet.sheets?.map((s) => s.properties?.title) ?? [];
  if (!existingSheets.includes(sheetName)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
    });
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A1:Z10000`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [header, ...rows] },
  });

  return {
    totalRows: rows.length,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

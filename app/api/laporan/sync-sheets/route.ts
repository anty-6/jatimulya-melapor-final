import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const runtime = "nodejs";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Kredensial Google Service Account belum diatur (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY)."
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/**
 * POST /api/laporan/sync-sheets
 * Body: { spreadsheetId?: string, sheetName?: string }
 *
 * Mendorong (push) seluruh data pengaduan terbaru ke Google Sheets yang
 * sudah dibagikan ke email service account dengan akses "Editor".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const supabase = createClient();

    let spreadsheetId = body.spreadsheetId as string | undefined;
    let sheetName = (body.sheetName as string | undefined) ?? "Pengaduan";

    if (!spreadsheetId) {
      const { data: settings } = await supabase
        .from("spreadsheet_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!settings) {
        return NextResponse.json(
          {
            message:
              "Belum ada Spreadsheet ID yang dikonfigurasi. Atur dulu di halaman Pengaturan.",
          },
          { status: 400 }
        );
      }
      spreadsheetId = settings.spreadsheet_id;
      sheetName = settings.sheet_name;
    }

    const { data: complaints, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

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

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Bersihkan isi sheet lalu tulis ulang dari awal supaya selalu sinkron
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z10000`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [header, ...rows] },
    });

    await supabase
      .from("spreadsheet_settings")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("spreadsheet_id", spreadsheetId);

    return NextResponse.json({
      message: "Sinkronisasi berhasil.",
      totalRows: rows.length,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message ?? "Gagal sinkronisasi ke Google Sheets." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const startDate = start ? new Date(start) : new Date(0);
  const endDate = end ? new Date(end) : new Date();
  endDate.setHours(23, 59, 59, 999);

  const { data: complaints, error } = await supabase
    .from("complaints")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const rows = (complaints ?? []).map((c, i) => ({
    No: i + 1,
    "ID Laporan": c.complaint_number,
    Tanggal: formatDate(c.created_at),
    Kategori: c.category,
    Judul: c.title,
    "Isi Laporan": c.description,
    Lokasi: c.location,
    "Nama Pelapor": c.is_anonymous ? "Anonim" : c.reporter_name || "-",
    "No. WhatsApp": c.is_anonymous ? "-" : c.reporter_phone || "-",
    Status: c.status,
    "Update Terakhir": formatDate(c.updated_at, true),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 4 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 28 },
    { wch: 40 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pengaduan");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="data-pengaduan.xlsx"`,
    },
  });
}

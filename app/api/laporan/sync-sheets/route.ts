import { NextResponse } from "next/server";
import { syncToSheets } from "@/lib/sync-sheets";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await syncToSheets();
    return NextResponse.json({ message: "Sinkronisasi berhasil.", ...result });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message ?? "Gagal sinkronisasi ke Google Sheets." },
      { status: 500 }
    );
  }
}

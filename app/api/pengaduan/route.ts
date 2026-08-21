import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { syncToSheets } from "@/lib/sync-sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("complaints")
      .insert({ ...body })
      .select("complaint_number")
      .single();

    if (error) throw error;

    // Auto-sync ke Google Sheets (fire & forget — tidak blokir response)
    syncToSheets().catch((err) =>
      console.error("Auto-sync sheets gagal:", err.message)
    );

    return NextResponse.json({ complaint_number: data.complaint_number });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status: 500 });
  }
}

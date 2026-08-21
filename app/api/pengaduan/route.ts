import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("body:", body);

    const supabase = createServiceRoleClient();
    console.log("supabase client created");

    const { data, error } = await supabase
      .from("complaints")
      .insert({ ...body })
      .select("complaint_number")
      .single();

    console.log("result:", { data, error });

    if (error) throw error;
    return NextResponse.json({ complaint_number: data.complaint_number });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status: 500 });
  }
}
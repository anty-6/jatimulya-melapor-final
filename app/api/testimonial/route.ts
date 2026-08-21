import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { name, role, rating, message } = await req.json();

    if (!name || !role || !rating || !message) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating tidak valid." }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase.from("testimonials").insert({
      name: name.trim(),
      role: role.trim(),
      rating,
      message: message.trim(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("TESTIMONIAL ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

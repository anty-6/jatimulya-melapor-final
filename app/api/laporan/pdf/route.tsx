import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServiceRoleClient } from "@/lib/supabase/server";
import RecapDocument from "@/lib/pdf/RecapDocument";
import DetailDocument from "@/lib/pdf/DetailDocument";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase     = createServiceRoleClient();
  const searchParams = request.nextUrl.searchParams;
  const id           = searchParams.get("id");
  const start        = searchParams.get("start");
  const end          = searchParams.get("end");
  const kepalaDesa   = searchParams.get("kepalaDesa") ?? undefined;
  const nipKepala    = searchParams.get("nipKepala")  ?? undefined;

  const pdfHeaders = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="rekapitulasi-pengaduan.pdf"`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };

  try {
    if (id) {
      const { data: complaint, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !complaint) {
        return NextResponse.json({ message: "Pengaduan tidak ditemukan" }, { status: 404 });
      }

      const { data: history } = await supabase
        .from("status_history")
        .select("*")
        .eq("complaint_id", id)
        .order("created_at", { ascending: false });

      const buffer = await renderToBuffer(
        DetailDocument({ complaint, history: history ?? [] }) as any
      );

      return new NextResponse(buffer, {
        headers: {
          ...pdfHeaders,
          "Content-Disposition": `inline; filename="${complaint.complaint_number}.pdf"`,
        },
      });
    }

    const startDate = start ? new Date(start) : new Date(0);
    const endDate   = end   ? new Date(end)   : new Date();
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

    const documentId = `REP-JM-${format(new Date(), "yyyy-MM-dd")}`;

    const buffer = await renderToBuffer(
      RecapDocument({
        complaints:  complaints ?? [],
        periodStart: format(startDate, "d MMMM yyyy", { locale: idLocale }),
        periodEnd:   format(endDate,   "d MMMM yyyy", { locale: idLocale }),
        documentId,
        kepalaDesa,
        nipKepala,
      }) as any
    );

    return new NextResponse(buffer, { headers: pdfHeaders });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message ?? "Gagal membuat PDF" },
      { status: 500 }
    );
  }
}
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(dateStr: string, withTime = false) {
  const dateObj = new Date(dateStr);
  return format(dateObj, withTime ? "d MMM yyyy, HH:mm 'WIB'" : "d MMM yyyy", {
    locale: id,
  });
}

/** Sensor sebagian NIK, contoh: 3216011234567890 -> 321601********90 */
export function maskNik(nik?: string | null) {
  if (!nik) return "-";
  if (nik.length <= 8) return nik;
  return nik.slice(0, 6) + "*".repeat(nik.length - 8) + nik.slice(-2);
}

/** Sensor nama pelapor untuk laporan anonim */
export function displayReporterName(complaint: {
  is_anonymous: boolean;
  reporter_name: string | null;
}) {
  if (complaint.is_anonymous) return "Pelapor Anonim";
  return complaint.reporter_name || "Tanpa Nama";
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

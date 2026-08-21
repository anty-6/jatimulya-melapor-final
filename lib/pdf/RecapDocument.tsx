import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Complaint } from "@/types/database";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const C = {
  navy: "#0c3a54",
  navyLight: "#1a5276",
  selesai: "#16a34a",
  proses: "#d97706",
  baru: "#2563eb",
  diverifikasi: "#7c3aed",
  ditolak: "#dc2626",
  border: "#c8c8c8",
  headerBg: "#e8edf2",
  rowAlt: "#f8fafc",
  text: "#1a1a1a",
  muted: "#555",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: C.text,
  },

  /* ── KOP ── */
  kopWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 6,
    borderBottomWidth: 3,
    borderBottomColor: C.navy,
  },
  logo: { width: 56, height: 56, marginRight: 14 },
  kopText: { flexGrow: 1, textAlign: "center" },
  kopLine1: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  kopLine2: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 1 },
  kopDesa: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    marginTop: 3,
    letterSpacing: 1,
  },
  kopAddress: { fontSize: 7.5, color: C.muted, marginTop: 3 },

  /* ── JUDUL ── */
  titleBlock: { marginTop: 14, marginBottom: 2, textAlign: "center" },
  titleMain: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  titleSub: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 1,
  },
  metaLine: { fontSize: 9, color: C.muted, textAlign: "center", marginTop: 5 },
  docId: { fontSize: 8.5, color: C.muted, textAlign: "center", marginTop: 2 },

  /* ── TABLE ── */
  table: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 2,
  },
  trHead: {
    flexDirection: "row",
    backgroundColor: C.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tr: { flexDirection: "row" },
  trAlt: { backgroundColor: C.rowAlt },
  th: {
    padding: 6,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    borderRightWidth: 1,
    borderRightColor: C.border,
    color: C.navy,
  },
  td: {
    padding: 6,
    fontSize: 8.5,
    borderRightWidth: 1,
    borderRightColor: C.border,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  tdLast: { borderRightWidth: 0 },
  thLast: { borderRightWidth: 0 },
  colNo: { width: 28 },
  colDate: { width: 60 },
  colName: { width: 90 },
  colSubject: { flexGrow: 1 },
  colStatus: { width: 68, alignItems: "center" },

  /* ── STATUS BADGE ── */
  badge: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },

  /* ── RINGKASAN ── */
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 20,
  },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: 8, color: C.muted },
  summaryValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.navy },

  footnote: {
    marginTop: 8,
    fontSize: 7.5,
    color: "#888",
  },

  /* ── TTD ── */
  signatureSection: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBlock: { alignItems: "center", width: 180 },
  signatureCity: { fontSize: 9.5, textAlign: "center" },
  signatureRole: {
    fontSize: 9.5,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  signatureGap: { height: 52 },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: C.text,
    width: 160,
    marginTop: 2,
  },
  signatureName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 4,
  },
  signatureNip: { fontSize: 8, color: C.muted, textAlign: "center", marginTop: 2 },
});

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  baru:         { bg: "#dbeafe", color: "#1d4ed8", label: "BARU" },
  diverifikasi: { bg: "#ede9fe", color: "#6d28d9", label: "VERIFIKASI" },
  diproses:     { bg: "#fef3c7", color: "#b45309", label: "PROSES" },
  selesai:      { bg: "#dcfce7", color: "#15803d", label: "SELESAI" },
  ditolak:      { bg: "#fee2e2", color: "#b91c1c", label: "DITOLAK" },
};

export default function RecapDocument({
  complaints,
  periodStart,
  periodEnd,
  documentId,
  kepalaDesa = "................................",
  nipKepala = "...................................",
}: {
  complaints: Complaint[];
  periodStart: string;
  periodEnd: string;
  documentId: string;
  kepalaDesa?: string;
  nipKepala?: string;
}) {
  const selesai   = complaints.filter((c) => c.status === "selesai").length;
  const proses    = complaints.filter((c) => c.status === "diproses").length;
  const pending   = complaints.filter((c) => c.status === "baru" || c.status === "diverifikasi").length;
  const today     = format(new Date(), "d MMMM yyyy", { locale: idLocale });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* KOP SURAT */}
        <View style={styles.kopWrapper}>
          {/* Logo placeholder — ganti src ke path logo desa jika ada */}
          {/* <Image style={styles.logo} src="/images/logo-desa.png" /> */}
          <View style={styles.kopText}>
            <Text style={styles.kopLine1}>PEMERINTAH KABUPATEN BEKASI</Text>
            <Text style={styles.kopLine2}>KECAMATAN TAMBUN SELATAN</Text>
            <Text style={styles.kopDesa}>DESA JATIMULYA</Text>
            <Text style={styles.kopAddress}>
              Jl. Jatimulya Raya No. 1, Bekasi, Jawa Barat 17510
            </Text>
            <Text style={styles.kopAddress}>
              Surel: desa@jatimulya.desa.id {"  |  "} Telp: (021) 8800123
            </Text>
          </View>
        </View>

        {/* JUDUL */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleMain}>Rekapitulasi Pengaduan</Text>
          <Text style={styles.titleSub}>Masyarakat</Text>
          <Text style={styles.metaLine}>
            Periode Laporan: {periodStart} {"–"} {periodEnd}
          </Text>
          <Text style={styles.docId}>ID Dokumen: {documentId}</Text>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.trHead}>
            <Text style={[styles.th, styles.colNo]}>No</Text>
            <Text style={[styles.th, styles.colDate]}>Tanggal</Text>
            <Text style={[styles.th, styles.colName]}>Nama Pelapor</Text>
            <Text style={[styles.th, styles.colSubject]}>Subjek Pengaduan</Text>
            <Text style={[styles.th, styles.colStatus, styles.thLast]}>Status</Text>
          </View>

          {/* Rows */}
          {complaints.map((c, i) => {
            const s = STATUS_STYLE[c.status] ?? { bg: "#f3f4f6", color: "#374151", label: c.status };
            const isAlt = i % 2 === 1;
            return (
              <View style={[styles.tr, isAlt ? styles.trAlt : {}]} key={c.id}>
                <Text style={[styles.td, styles.colNo, { textAlign: "center" }]}>{i + 1}</Text>
                <Text style={[styles.td, styles.colDate]}>
                  {format(new Date(c.created_at), "d MMM yyyy", { locale: idLocale })}
                </Text>
                <Text style={[styles.td, styles.colName]}>
                  {c.is_anonymous ? "Anonim" : c.reporter_name || "–"}
                </Text>
                <Text style={[styles.td, styles.colSubject]}>{c.title}</Text>
                <View style={[styles.td, styles.colStatus, styles.tdLast, { justifyContent: "center", alignItems: "center" }]}>
                  <Text style={[styles.badge, { backgroundColor: s.bg, color: s.color }]}>
                    {s.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* RINGKASAN */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Laporan</Text>
            <Text style={[styles.summaryValue, { color: C.navy }]}>{complaints.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selesai</Text>
            <Text style={[styles.summaryValue, { color: C.selesai }]}>{selesai}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Dalam Proses</Text>
            <Text style={[styles.summaryValue, { color: "#d97706" }]}>{proses}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Menunggu</Text>
            <Text style={[styles.summaryValue, { color: "#2563eb" }]}>{pending}</Text>
          </View>
        </View>

        <Text style={styles.footnote}>
          * Dokumen ini dihasilkan secara otomatis oleh sistem Jatimulya Melapor.{"\n"}
          Data per tanggal: {format(new Date(), "d MMMM yyyy HH:mm", { locale: idLocale })} WIB
        </Text>

        {/* TTD */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureCity}>Bekasi, {today}</Text>
            <Text style={styles.signatureRole}>Kepala Desa Jatimulya</Text>
            <View style={styles.signatureGap} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{kepalaDesa}</Text>
            <Text style={styles.signatureNip}>NIP. {nipKepala}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
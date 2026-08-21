import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Complaint, StatusHistoryItem } from "@/types/database";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: "#0c3a54",
    paddingBottom: 10,
    marginBottom: 16,
    textAlign: "center",
  },
  govLine: { fontSize: 10, fontWeight: 700 },
  villageLine: { fontSize: 14, fontWeight: 700, color: "#0c3a54", marginTop: 2 },
  title: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: 130, color: "#555" },
  value: { flex: 1, fontWeight: 700 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0c3a54",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
  },
  body: { lineHeight: 1.5 },
  historyItem: { marginBottom: 8 },
  historyMeta: { color: "#777", fontSize: 8 },
});

export default function DetailDocument({
  complaint,
  history,
}: {
  complaint: Complaint;
  history: StatusHistoryItem[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.govLine}>PEMERINTAH KABUPATEN BEKASI</Text>
          <Text style={styles.govLine}>KECAMATAN TAMBUN SELATAN</Text>
          <Text style={styles.villageLine}>DESA JATIMULYA</Text>
        </View>

        <Text style={styles.title}>Detail Pengaduan Masyarakat</Text>

        <View style={styles.row}>
          <Text style={styles.label}>ID Laporan</Text>
          <Text style={styles.value}>{complaint.complaint_number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal Dibuat</Text>
          <Text style={styles.value}>
            {format(new Date(complaint.created_at), "d MMMM yyyy, HH:mm", {
              locale: idLocale,
            })}{" "}
            WIB
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kategori</Text>
          <Text style={styles.value}>{complaint.category}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nama Pelapor</Text>
          <Text style={styles.value}>
            {complaint.is_anonymous
              ? "Pelapor Anonim"
              : complaint.reporter_name || "-"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Lokasi</Text>
          <Text style={styles.value}>{complaint.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status Saat Ini</Text>
          <Text style={styles.value}>{complaint.status.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{complaint.title}</Text>
          <Text style={styles.body}>{complaint.description}</Text>
        </View>

        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Status</Text>
            {history.map((h) => (
              <View key={h.id} style={styles.historyItem}>
                <Text style={{ fontWeight: 700 }}>
                  {h.status.toUpperCase()}
                </Text>
                <Text style={styles.historyMeta}>
                  {format(new Date(h.created_at), "d MMM yyyy, HH:mm", {
                    locale: idLocale,
                  })}{" "}
                  WIB {h.changed_by ? `oleh ${h.changed_by}` : ""}
                </Text>
                {h.note && <Text style={styles.body}>{h.note}</Text>}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

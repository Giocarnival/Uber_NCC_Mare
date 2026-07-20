import { useState } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Share } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AdminStatCard } from "@/components/AdminStatCard";
import { colors, spacing, typography } from "@/constants/theme";
import { computeDailyReport, type DailyReport } from "@/services/reportService";
import { todayISO, formatDateIT } from "@/utils/dateUtils";

function dateRange(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const start = new Date(startISO);
  const end = new Date(endISO);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function AdminReportsScreen() {
  const [dataInizio, setDataInizio] = useState(todayISO());
  const [dataFine, setDataFine] = useState(todayISO());
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const dates = dateRange(dataInizio, dataFine).slice(0, 62); // max ~2 mesi per chiamata
      const results = await Promise.all(dates.map((d) => computeDailyReport(d)));
      setReports(results);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    const header = "data,incasso,passeggeri,corse,riempimento_medio";
    const rows = reports.map(
      (r) => `${r.data},${r.incasso.toFixed(2)},${r.passeggeri},${r.corse},${(r.tassoRiempimentoMedio * 100).toFixed(0)}%`
    );
    const csv = [header, ...rows].join("\n");
    await Share.share({ message: csv, title: "Report Sabaudia Shuttle" });
  }

  const totali = reports.reduce(
    (acc, r) => ({ incasso: acc.incasso + r.incasso, passeggeri: acc.passeggeri + r.passeggeri, corse: acc.corse + r.corse }),
    { incasso: 0, passeggeri: 0, corse: 0 }
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TextInput style={styles.input} placeholder="Data inizio" value={dataInizio} onChangeText={setDataInizio} />
        <TextInput style={styles.input} placeholder="Data fine" value={dataFine} onChangeText={setDataFine} />
      </View>
      <PrimaryButton label="Genera report" onPress={handleGenerate} loading={loading} />

      {reports.length > 0 && (
        <>
          <View style={styles.statsRow}>
            <AdminStatCard label="Incasso totale" value={`${totali.incasso.toFixed(2)} €`} />
            <AdminStatCard label="Passeggeri" value={String(totali.passeggeri)} />
            <AdminStatCard label="Corse" value={String(totali.corse)} />
          </View>
          <PrimaryButton label="Esporta CSV" variant="secondary" onPress={handleExportCSV} />
        </>
      )}

      <FlatList
        data={reports}
        keyExtractor={(r) => r.data}
        contentContainerStyle={{ gap: spacing.xs, marginTop: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowDate}>{formatDateIT(item.data)}</Text>
            <Text style={styles.rowValue}>{item.incasso.toFixed(2)} €</Text>
            <Text style={styles.rowValue}>{item.passeggeri} pax</Text>
            <Text style={styles.rowValue}>{(item.tassoRiempimentoMedio * 100).toFixed(0)}%</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  filterRow: { flexDirection: "row", gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowDate: { fontWeight: "700", color: colors.ink },
  rowValue: { color: colors.muted, fontSize: typography.caption.fontSize },
});

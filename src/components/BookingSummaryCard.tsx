import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface Props {
  origine: string;
  destinazione: string;
  data: string;
  orario: string;
  numeroPasseggeri: number;
  prezzoTotale: number;
  andataERitorno?: boolean;
}

export function BookingSummaryCard({
  origine,
  destinazione,
  data,
  orario,
  numeroPasseggeri,
  prezzoTotale,
  andataERitorno,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.routeRow}>
        <View style={styles.dotsColumn}>
          <View style={[styles.dot, { backgroundColor: colors.sea }]} />
          <View style={styles.dotLine} />
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        </View>
        <View style={styles.stopsColumn}>
          <Text style={styles.stopText}>{origine}</Text>
          <View style={{ height: spacing.md }} />
          <Text style={styles.stopText}>{destinazione}</Text>
        </View>
        {andataERitorno && (
          <View style={styles.arBadge}>
            <Text style={styles.arBadgeText}>A/R</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <Row label="Data" value={data} />
      <Row label="Orario" value={orario} />
      <Row label="Passeggeri" value={String(numeroPasseggeri)} />

      <View style={styles.divider} />
      <Row label="Totale" value={`${prezzoTotale.toFixed(2)} €`} emphasize />
    </View>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, emphasize && styles.emphasize]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeRow: { flexDirection: "row", gap: spacing.sm },
  dotsColumn: { alignItems: "center", paddingTop: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: colors.border, marginVertical: 2 },
  stopsColumn: { flex: 1 },
  stopText: { color: colors.ink, fontSize: typography.body.fontSize, fontWeight: "700" },
  arBadge: {
    backgroundColor: colors.sand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  arBadgeText: { color: colors.seaDark, fontWeight: "800", fontSize: typography.caption.fontSize },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs },
  label: { color: colors.muted, fontSize: typography.body.fontSize },
  value: { color: colors.ink, fontSize: typography.body.fontSize, fontWeight: "600" },
  emphasize: { fontSize: typography.heading.fontSize, color: colors.accentDark, fontWeight: "800" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});

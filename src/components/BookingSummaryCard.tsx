import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface Props {
  tratta: string;
  data: string;
  orario: string;
  numeroPasseggeri: number;
  prezzoTotale: number;
}

export function BookingSummaryCard({ tratta, data, orario, numeroPasseggeri, prezzoTotale }: Props) {
  return (
    <View style={styles.card}>
      <Row label="Tratta" value={tratta} />
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
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs },
  label: { color: colors.muted, fontSize: typography.body.fontSize },
  value: { color: colors.ink, fontSize: typography.body.fontSize, fontWeight: "600" },
  emphasize: { fontSize: typography.heading.fontSize, color: colors.sea, fontWeight: "800" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});

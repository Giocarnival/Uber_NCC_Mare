import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface Props {
  label: string;
  value: string;
  hint?: string;
}

export function AdminStatCard({ label, value, hint }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  label: { color: colors.muted, fontSize: typography.caption.fontSize },
  value: { color: colors.ink, fontSize: typography.heading.fontSize, fontWeight: "800", marginTop: 4 },
  hint: { color: colors.muted, fontSize: typography.caption.fontSize, marginTop: 4 },
});

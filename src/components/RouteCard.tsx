import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";
import type { Route } from "../types";

interface Props {
  route: Route;
  selected?: boolean;
  onPress: () => void;
}

export function RouteCard({ route, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.selected]}>
      <Text style={styles.title}>{route.origine}</Text>
      <Text style={styles.arrow}>→</Text>
      <Text style={styles.title}>{route.destinazione}</Text>
      <Text style={styles.meta}>
        {route.distanzaKm} km · ~{route.durataStimataMinuti} min
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  selected: { borderColor: colors.sea, backgroundColor: colors.sand },
  title: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.ink },
  arrow: { color: colors.sea, marginVertical: 2 },
  meta: { marginTop: spacing.xs, fontSize: typography.caption.fontSize, color: colors.muted },
});

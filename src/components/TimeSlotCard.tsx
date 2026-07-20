import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";
import type { TimeSlot } from "../types";

interface Props {
  slot: TimeSlot;
  selected?: boolean;
  onPress: () => void;
}

export function TimeSlotCard({ slot, selected, onPress }: Props) {
  const soldOut = slot.postiDisponibili <= 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={soldOut}
      style={[styles.card, selected && styles.selected, soldOut && styles.soldOut]}
    >
      <Text style={[styles.time, soldOut && styles.soldOutText]}>{slot.oraPartenza}</Text>
      <Text style={[styles.seats, soldOut && styles.soldOutText]}>
        {soldOut ? "Esaurito" : `${slot.postiDisponibili} posti`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    minWidth: 84,
    backgroundColor: colors.white,
  },
  selected: { borderColor: colors.sea, backgroundColor: colors.sand },
  soldOut: { opacity: 0.4 },
  time: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.ink },
  seats: { fontSize: typography.caption.fontSize, color: colors.muted, marginTop: 2 },
  soldOutText: { color: colors.muted },
});

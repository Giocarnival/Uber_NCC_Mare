import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TimeSlotCard } from "@/components/TimeSlotCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listTimeSlotsForRouteAndDate } from "@/services/timeSlotService";
import { todayISO, formatDateIT } from "@/utils/dateUtils";
import type { TimeSlot } from "@/types";

function nextDays(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function TimeSlotSelectionScreen() {
  const { routeId, andataERitorno } = useLocalSearchParams<{ routeId: string; andataERitorno: string }>();
  const dates = useMemo(() => nextDays(14), []);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [passeggeri, setPasseggeri] = useState(1);

  useEffect(() => {
    setSelectedSlotId(null);
    if (!routeId) return;
    listTimeSlotsForRouteAndDate(routeId, selectedDate).then(setSlots).catch(() => setSlots([]));
  }, [routeId, selectedDate]);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null;
  const maxPasseggeri = selectedSlot?.postiDisponibili ?? 8;

  function handleContinue() {
    if (!selectedSlot || !routeId) return;
    router.push({
      pathname: "/(customer)/booking-summary",
      params: {
        routeId,
        timeSlotId: selectedSlot.id,
        data: selectedDate,
        oraPartenza: selectedSlot.oraPartenza,
        passeggeri: String(passeggeri),
        andataERitorno,
      },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Data</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {dates.map((d) => (
          <Pressable
            key={d}
            onPress={() => setSelectedDate(d)}
            style={[styles.dateChip, d === selectedDate && styles.dateChipSelected]}
          >
            <Text style={[styles.dateChipText, d === selectedDate && styles.dateChipTextSelected]}>
              {formatDateIT(d)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Orario</Text>
      <ScrollView contentContainerStyle={styles.slotGrid}>
        {slots.length === 0 ? (
          <Text style={styles.empty}>Nessuno slot disponibile per questa data.</Text>
        ) : (
          slots.map((s) => (
            <TimeSlotCard key={s.id} slot={s} selected={s.id === selectedSlotId} onPress={() => setSelectedSlotId(s.id)} />
          ))
        )}
      </ScrollView>

      {selectedSlot && (
        <View style={styles.passengerRow}>
          <Text style={styles.label}>Passeggeri</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setPasseggeri((p) => Math.max(1, p - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{passeggeri}</Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setPasseggeri((p) => Math.min(maxPasseggeri, p + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      )}

      <PrimaryButton label="Continua" onPress={handleContinue} disabled={!selectedSlot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  label: { fontSize: typography.body.fontSize, fontWeight: "700", color: colors.ink, marginTop: spacing.sm },
  dateRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  dateChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  dateChipSelected: { backgroundColor: colors.sea, borderColor: colors.sea },
  dateChipText: { color: colors.ink, fontWeight: "600" },
  dateChipTextSelected: { color: colors.white },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  empty: { color: colors.muted },
  passengerRow: { gap: spacing.xs },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.sea,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: { fontSize: 20, color: colors.sea, fontWeight: "800" },
  stepperValue: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink, minWidth: 24, textAlign: "center" },
});

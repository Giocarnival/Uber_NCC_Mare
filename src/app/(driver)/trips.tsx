import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getDriverByUserId } from "@/services/driverService";
import { listTimeSlotsForVehicleAndDate } from "@/services/timeSlotService";
import { todayISO } from "@/utils/dateUtils";
import type { TimeSlot } from "@/types";

export default function DriverTripsScreen() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (!user) return;
    getDriverByUserId(user.uid).then((driver) => {
      if (!driver?.vehicleId) return;
      listTimeSlotsForVehicleAndDate(driver.vehicleId, todayISO()).then(setSlots);
    });
  }, [user]);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={slots}
      keyExtractor={(s) => s.id}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/(driver)/trip/${item.id}`)}>
          <Text style={styles.time}>{item.oraPartenza}</Text>
          <Text style={styles.meta}>{item.postiDisponibili} posti disponibili</Text>
        </Pressable>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Nessuna corsa assegnata oggi.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  time: { fontWeight: "800", fontSize: typography.heading.fontSize, color: colors.ink },
  meta: { color: colors.muted, marginTop: spacing.xs },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.xl },
});

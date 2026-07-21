import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getDriverByUserId } from "@/services/driverService";
import { listBookingsForVehicleAndSlot, markBookingStatus } from "@/services/bookingService";
import type { Booking } from "@/types";

export default function DriverTripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  async function load(currentVehicleId: string) {
    const all = await listBookingsForVehicleAndSlot(currentVehicleId, id).catch(() => [] as Booking[]);
    setBookings(all);
  }

  useEffect(() => {
    if (!user) return;
    getDriverByUserId(user.uid).then((driver) => {
      if (!driver?.vehicleId) return;
      setVehicleId(driver.vehicleId);
      load(driver.vehicleId);
    });
  }, [user, id]);

  async function confirmBoarding(bookingId: string) {
    await markBookingStatus(bookingId, "completed");
    if (vehicleId) load(vehicleId);
  }

  return (
    <View style={styles.container}>
      <PrimaryButton
        label={started ? "Corsa avviata" : "Avvia corsa"}
        onPress={() => setStarted(true)}
        disabled={started}
      />
      <PrimaryButton
        label="Scansiona QR biglietto"
        icon="qr-code-outline"
        variant="accent"
        onPress={() => router.push("/(driver)/qr-scan" as any)}
      />

      <Text style={styles.sectionTitle}>Passeggeri prenotati</Text>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.code}>{item.bookingCode}</Text>
              <Text style={styles.meta}>{item.numeroPasseggeri} passeggeri · {item.stato}</Text>
            </View>
            {item.stato === "paid" && (
              <PrimaryButton label="Conferma salita" onPress={() => confirmBoarding(item.id)} />
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessun passeggero prenotato.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  sectionTitle: { fontWeight: "800", fontSize: typography.body.fontSize, color: colors.ink },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  code: { fontWeight: "800", color: colors.ink, letterSpacing: 1 },
  meta: { color: colors.muted, marginTop: 2 },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});

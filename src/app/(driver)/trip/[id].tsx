import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listBookingsForSlot, markBookingStatus } from "@/services/bookingService";
import type { Booking } from "@/types";

export default function DriverTripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [started, setStarted] = useState(false);

  async function load() {
    const all = await listBookingsForSlot(id).catch(() => [] as Booking[]);
    setBookings(all);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function confirmBoarding(bookingId: string) {
    await markBookingStatus(bookingId, "completed");
    load();
  }

  return (
    <View style={styles.container}>
      <PrimaryButton
        label={started ? "Corsa avviata" : "Avvia corsa"}
        onPress={() => setStarted(true)}
        disabled={started}
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

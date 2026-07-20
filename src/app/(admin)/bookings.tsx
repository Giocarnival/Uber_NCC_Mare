import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listAllBookings, cancelBookingAndReleaseSeats } from "@/services/bookingService";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { Booking, BookingStatus } from "@/types";

const filters: Array<{ label: string; value: BookingStatus | "all" }> = [
  { label: "Tutte", value: "all" },
  { label: "In attesa", value: "pending" },
  { label: "Pagate", value: "paid" },
  { label: "Completate", value: "completed" },
  { label: "Annullate", value: "cancelled" },
];

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  async function load() {
    const data = await listAllBookings(filter === "all" ? undefined : { stato: filter });
    setBookings(data);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function handleCancel(bookingId: string) {
    await cancelBookingAndReleaseSeats(bookingId);
    await load();
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[styles.filterChip, filter === f.value && styles.filterChipSelected]}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextSelected]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ gap: spacing.sm, marginTop: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.code}>{item.bookingCode}</Text>
              <Text style={styles.meta}>
                {item.numeroPasseggeri} pax · {item.prezzoTotale.toFixed(2)} € · {item.stato}
              </Text>
            </View>
            {(item.stato === "pending" || item.stato === "paid") && (
              <PrimaryButton label="Annulla" variant="danger" onPress={() => handleCancel(item.id)} />
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessuna prenotazione trovata.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  filterRow: { gap: spacing.sm },
  filterChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  filterChipSelected: { backgroundColor: colors.sea, borderColor: colors.sea },
  filterText: { color: colors.ink, fontWeight: "600" },
  filterTextSelected: { color: colors.white },
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
  meta: { color: colors.muted, marginTop: 2, fontSize: typography.caption.fontSize },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});

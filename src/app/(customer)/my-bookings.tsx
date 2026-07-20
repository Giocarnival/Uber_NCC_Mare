import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { listBookingsForUser } from "@/services/bookingService";
import type { Booking, BookingStatus } from "@/types";

const statusLabel: Record<BookingStatus, string> = {
  pending: "In attesa di pagamento",
  paid: "Confermata",
  cancelled: "Annullata",
  completed: "Completata",
  no_show: "No show",
};

const statusColor: Record<BookingStatus, string> = {
  pending: colors.warning,
  paid: colors.success,
  cancelled: colors.danger,
  completed: colors.muted,
  no_show: colors.danger,
};

export default function MyBookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!user) return;
    const data = await listBookingsForUser(user.uid);
    setBookings(data);
  }

  useEffect(() => {
    load();
  }, [user]);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={bookings}
      keyExtractor={(b) => b.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.code}>{item.bookingCode}</Text>
            <Text style={[styles.status, { color: statusColor[item.stato] }]}>{statusLabel[item.stato]}</Text>
          </View>
          <Text style={styles.meta}>
            {item.numeroPasseggeri} passeggeri · {item.prezzoTotale.toFixed(2)} €
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Non hai ancora prenotazioni.</Text>}
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
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { fontWeight: "800", color: colors.ink, letterSpacing: 1 },
  status: { fontWeight: "700", fontSize: typography.caption.fontSize },
  meta: { color: colors.muted, marginTop: spacing.xs },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.xl },
});

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { listBookingsForUser, cancelBookingAndReleaseSeats } from "@/services/bookingService";
import { getTimeSlot } from "@/services/timeSlotService";
import { getRoute } from "@/services/routeService";
import { formatDateIT, combineDateAndTime } from "@/utils/dateUtils";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { Booking, BookingStatus, Route, TimeSlot } from "@/types";

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

// Cancellazione gratuita fino a 2 ore prima della partenza (vedi
// docs/CAPITOLATO_FUNZIONALE.md §7 e adminSettings.cancellationPolicy).
const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000;

interface EnrichedBooking {
  booking: Booking;
  slot: TimeSlot | null;
  route: Route | null;
}

export default function MyBookingsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<EnrichedBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    const bookings = await listBookingsForUser(user.uid);
    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        const slot = await getTimeSlot(booking.timeSlotId).catch(() => null);
        const route = slot ? await getRoute(slot.routeId).catch(() => null) : null;
        return { booking, slot, route };
      })
    );
    setItems(enriched);
  }

  useEffect(() => {
    load();
  }, [user]);

  function canCancel(booking: Booking, slot: TimeSlot | null): boolean {
    if (booking.stato !== "paid" || !slot) return false;
    const departure = combineDateAndTime(slot.data, slot.oraPartenza);
    return departure.getTime() - Date.now() > CANCELLATION_WINDOW_MS;
  }

  function handleCancel(booking: Booking) {
    Alert.alert("Annullare la prenotazione?", `${booking.bookingCode} — l'importo pagato non viene rimborsato automaticamente.`, [
      { text: "No", style: "cancel" },
      {
        text: "Sì, annulla",
        style: "destructive",
        onPress: async () => {
          setCancellingId(booking.id);
          try {
            await cancelBookingAndReleaseSeats(booking.id);
            await load();
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={items}
      keyExtractor={({ booking }) => booking.id}
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
      renderItem={({ item: { booking, slot, route } }) => (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.code}>{booking.bookingCode}</Text>
            <Text style={[styles.status, { color: statusColor[booking.stato] }]}>
              {statusLabel[booking.stato]}
            </Text>
          </View>
          {route && (
            <Text style={styles.route}>
              {route.origine} → {route.destinazione}
            </Text>
          )}
          {slot && (
            <Text style={styles.meta}>
              {formatDateIT(slot.data)} · {slot.oraPartenza}
            </Text>
          )}
          <Text style={styles.meta}>
            {booking.numeroPasseggeri} passeggeri · {booking.prezzoTotale.toFixed(2)} €
          </Text>
          {canCancel(booking, slot) && (
            <PrimaryButton
              label="Annulla prenotazione"
              variant="secondary"
              loading={cancellingId === booking.id}
              onPress={() => handleCancel(booking)}
              style={styles.cancelBtn}
            />
          )}
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
    gap: 2,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { fontWeight: "800", color: colors.ink, letterSpacing: 1 },
  status: { fontWeight: "700", fontSize: typography.caption.fontSize },
  route: { color: colors.ink, fontWeight: "600", marginTop: spacing.xs },
  meta: { color: colors.muted },
  cancelBtn: { marginTop: spacing.sm },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.xl },
});

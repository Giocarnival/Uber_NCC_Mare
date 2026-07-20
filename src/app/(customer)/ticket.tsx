import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TicketQRCode } from "@/components/TicketQRCode";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { getBooking } from "@/services/bookingService";
import type { Booking } from "@/types";

export default function TicketScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    getBooking(bookingId).then(setBooking);
  }, [bookingId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prenotazione confermata 🎉</Text>
      {booking ? (
        <TicketQRCode bookingCode={booking.bookingCode} />
      ) : (
        <ActivityIndicator color={colors.sea} />
      )}
      <Text style={styles.hint}>Mostra questo codice all'autista al momento della salita.</Text>
      <PrimaryButton label="Torna alla home" onPress={() => router.replace("/(customer)")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  hint: { color: colors.muted, textAlign: "center" },
});

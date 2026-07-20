import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { createPaymentIntent } from "@/services/paymentService";
import { cancelBookingAndReleaseSeats, subscribeToBooking } from "@/services/bookingService";

/**
 * Pagamento reale con Stripe PaymentSheet (iOS/Android). I dati carta sono
 * raccolti interamente dallo Stripe SDK: questo schermo non li vede né li
 * salva. Dopo `presentPaymentSheet`, l'esito definitivo arriva in modo
 * asincrono dal webhook Stripe lato server (functions/src/payments.ts), che
 * aggiorna bookings.stato — qui restiamo in ascolto realtime finché non
 * diventa "paid" prima di mostrare il ticket.
 */
export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [initializing, setInitializing] = useState(true);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { clientSecret } = await createPaymentIntent({ bookingId, amount: 0 });
        const { error } = await initPaymentSheet({
          merchantDisplayName: "Sabaudia Shuttle",
          paymentIntentClientSecret: clientSecret,
        });
        if (cancelled) return;
        if (error) setInitError(error.message);
        else setReady(true);
      } catch (err: any) {
        if (!cancelled) setInitError(err?.message ?? "Impossibile inizializzare il pagamento.");
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
    };
  }, [bookingId]);

  async function handlePay() {
    setPaying(true);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== "Canceled") Alert.alert("Pagamento non riuscito", error.message);
        return;
      }

      unsubscribeRef.current = subscribeToBooking(bookingId, (booking) => {
        if (booking.stato === "paid") {
          unsubscribeRef.current?.();
          router.replace({ pathname: "/(customer)/ticket", params: { bookingId } });
        }
      });
    } finally {
      setPaying(false);
    }
  }

  async function handleCancel() {
    unsubscribeRef.current?.();
    await cancelBookingAndReleaseSeats(bookingId);
    router.replace("/(customer)");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento</Text>
      <Text style={styles.note}>
        I dati della tua carta sono gestiti direttamente da Stripe: questa app non li vede né li
        salva.
      </Text>

      {initializing && <ActivityIndicator color={colors.sea} />}
      {initError && <Text style={styles.error}>{initError}</Text>}

      <PrimaryButton label="Paga ora" onPress={handlePay} loading={paying} disabled={!ready} />
      <PrimaryButton label="Annulla prenotazione" variant="secondary" onPress={handleCancel} disabled={paying} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  note: { color: colors.muted, fontSize: typography.caption.fontSize },
  error: { color: colors.danger, fontSize: typography.caption.fontSize },
});

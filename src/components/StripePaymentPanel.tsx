import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { createPaymentIntent } from "@/services/paymentService";
import { cancelBookingAndReleaseSeats, subscribeToBooking } from "@/services/bookingService";

interface Props {
  bookingId: string;
}

/**
 * Pagamento reale con Stripe PaymentSheet (iOS/Android). Vive in
 * src/components (non in src/app) apposta: i file dentro src/app vengono
 * enumerati da Expo Router tramite require.context anche per il bundle web
 * indipendentemente dalle varianti .web.tsx, quindi qualunque import statico
 * di "@stripe/stripe-react-native" lì dentro romperebbe comunque il bundle
 * web. Qui invece la risoluzione per-piattaforma di Metro (StripePaymentPanel.web.tsx)
 * funziona correttamente perché è un import normale, non una route.
 */
export function StripePaymentPanel({ bookingId }: Props) {
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
  container: { gap: spacing.md },
  note: { color: colors.muted, fontSize: typography.caption.fontSize },
  error: { color: colors.danger, fontSize: typography.caption.fontSize },
});

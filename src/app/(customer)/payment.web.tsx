import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { createPaymentIntent } from "@/services/paymentService";
import { markBookingStatus, cancelBookingAndReleaseSeats } from "@/services/bookingService";

/**
 * Variante web (Metro seleziona automaticamente questo file per la piattaforma
 * "web" al posto di payment.tsx). @stripe/stripe-react-native è un modulo
 * nativo privo di build web: una vera integrazione web richiede invece
 * "@stripe/stripe-js" + Stripe Elements. In attesa di quell'integrazione,
 * questo schermo chiama comunque la Cloud Function createPaymentIntent per
 * validare il flusso server-side, e simula l'esito lato client.
 */
export default function PaymentScreenWeb() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      await createPaymentIntent({ bookingId, amount: 0 }).catch(() => null);
      await markBookingStatus(bookingId, "paid");
      router.replace({ pathname: "/(customer)/ticket", params: { bookingId } });
    } catch (err: any) {
      Alert.alert("Pagamento non riuscito", err?.message ?? "Riprova.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelBookingAndReleaseSeats(bookingId);
      router.replace("/(customer)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento</Text>
      <Text style={styles.note}>
        Versione web di sviluppo: il pagamento è simulato. L'app mobile usa Stripe PaymentSheet
        reale — l'integrazione web con Stripe Elements è nella roadmap.
      </Text>
      <PrimaryButton label="Paga ora (simulato)" onPress={handlePay} loading={loading} />
      <PrimaryButton label="Annulla prenotazione" variant="secondary" onPress={handleCancel} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  note: { color: colors.muted, fontSize: typography.caption.fontSize },
});

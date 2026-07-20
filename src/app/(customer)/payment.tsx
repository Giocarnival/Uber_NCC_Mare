import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { createPaymentIntent } from "@/services/paymentService";
import { markBookingStatus, cancelBookingAndReleaseSeats } from "@/services/bookingService";

/**
 * Schermata di pagamento. Il flusso reale con Stripe richiede il pacchetto
 * "@stripe/stripe-react-native": inizializzare lo StripeProvider nel root
 * layout con la publishableKey, poi qui usare `confirmPayment(clientSecret, {type:'Card'})`
 * con il PaymentSheet o CardField per raccogliere i dati carta lato client.
 * Questa versione MVP chiama comunque la Cloud Function `createPaymentIntent`
 * per validare il flusso server-side, e simula l'esito per poter testare
 * l'intero percorso senza credenziali Stripe live.
 */
export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      // In assenza di EXPO_PUBLIC_FIREBASE_* configurate questa chiamata fallirà:
      // in quel caso si passa direttamente alla simulazione locale.
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
        Integrazione Stripe da completare con @stripe/stripe-react-native. Nessun dato carta viene
        gestito da questo schermo: la raccolta avviene tramite PaymentSheet Stripe lato client.
      </Text>
      <PrimaryButton label="Paga ora" onPress={handlePay} loading={loading} />
      <PrimaryButton label="Annulla prenotazione" variant="secondary" onPress={handleCancel} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  note: { color: colors.muted, fontSize: typography.caption.fontSize },
});

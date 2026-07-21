import { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BookingSummaryCard } from "@/components/BookingSummaryCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { createBooking } from "@/services/bookingService";
import { calcolaPrezzo } from "@/utils/priceCalculator";
import { getAdminSettings } from "@/services/adminSettingsService";
import { getRoute } from "@/services/routeService";
import { formatDateIT } from "@/utils/dateUtils";
import { DEFAULT_PRICING } from "@/constants/config";
import type { Route } from "@/types";

export default function BookingSummaryScreen() {
  const params = useLocalSearchParams<{
    routeId: string;
    timeSlotId: string;
    data: string;
    oraPartenza: string;
    passeggeri: string;
    andataERitorno: string;
  }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);
  const [pricing, setPricing] = useState({
    prezzoSingola: DEFAULT_PRICING.prezzoSingola,
    prezzoAR: DEFAULT_PRICING.prezzoAR,
  });

  useEffect(() => {
    getAdminSettings().then((s) => setPricing({ prezzoSingola: s.prezzoSingola, prezzoAR: s.prezzoAR }));
    getRoute(params.routeId).then(setRoute);
  }, [params.routeId]);

  const numeroPasseggeri = Number(params.passeggeri) || 1;
  const andataERitorno = params.andataERitorno === "1";
  const prezzoTotale = calcolaPrezzo({ numeroPasseggeri, andataERitorno, ...pricing });

  async function handleConfirm() {
    if (!user) {
      Alert.alert("Sessione scaduta", "Effettua di nuovo l'accesso.");
      return;
    }
    setLoading(true);
    try {
      const booking = await createBooking({
        userId: user.uid,
        routeId: params.routeId,
        timeSlotId: params.timeSlotId,
        numeroPasseggeri,
        andataERitorno,
      });
      router.push({ pathname: "/(customer)/payment", params: { bookingId: booking.id } });
    } catch (err: any) {
      Alert.alert("Prenotazione non riuscita", err?.message ?? "Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <BookingSummaryCard
        origine={route?.origine ?? "…"}
        destinazione={route?.destinazione ?? "…"}
        data={formatDateIT(params.data)}
        orario={params.oraPartenza}
        numeroPasseggeri={numeroPasseggeri}
        prezzoTotale={prezzoTotale}
        andataERitorno={andataERitorno}
      />
      <PrimaryButton label="Conferma prenotazione" variant="accent" onPress={handleConfirm} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: "center" },
});

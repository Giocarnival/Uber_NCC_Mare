import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { VehicleMapView } from "@/components/VehicleMapView";
import { colors, spacing, typography } from "@/constants/theme";
import { STOPS } from "@/constants/config";
import { useAuth } from "@/context/AuthContext";
import { subscribeToVehicleLocations } from "@/services/locationService";
import { listActiveVehicles } from "@/services/vehicleService";
import { getETAToNearestStop } from "@/services/routesApiService";
import type { Vehicle, VehicleLocation } from "@/types";

const STOP_LIST = [STOPS.sabaudiaCentro, STOPS.lungomare];

export default function CustomerHomeScreen() {
  const { profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<VehicleLocation[]>([]);
  const [etaByVehicle, setEtaByVehicle] = useState<Record<string, number | null>>({});

  useEffect(() => {
    listActiveVehicles().then(setVehicles).catch(() => {});
    const unsub = subscribeToVehicleLocations(setLocations);
    return unsub;
  }, []);

  useEffect(() => {
    locations.forEach((loc) => {
      getETAToNearestStop({ lat: loc.lat, lng: loc.lng }, STOP_LIST).then((eta) => {
        setEtaByVehicle((prev) => ({ ...prev, [loc.vehicleId]: eta }));
      });
    });
  }, [locations]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Ciao{profile?.nome ? `, ${profile.nome}` : ""} 👋</Text>
      <Text style={styles.subtitle}>Dove vuoi andare oggi?</Text>

      <View style={styles.mapWrap}>
        <VehicleMapView vehicles={vehicles} locations={locations} etaByVehicle={etaByVehicle} />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Prenota un posto"
          icon="add-circle-outline"
          onPress={() => router.push("/(customer)/route-selection")}
        />
        <PrimaryButton
          label="Le mie prenotazioni"
          icon="ticket-outline"
          variant="secondary"
          onPress={() => router.push("/(customer)/my-bookings")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  greeting: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted },
  mapWrap: { flex: 1, borderRadius: 16, overflow: "hidden", backgroundColor: colors.white },
  actions: { gap: spacing.sm },
});

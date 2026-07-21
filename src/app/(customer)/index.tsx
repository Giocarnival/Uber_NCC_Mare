import { useEffect, useRef, useState } from "react";
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

// I veicoli inviano la posizione ogni 10-15s (vedi DriverDutyContext), ma
// l'ETA via Google Routes API viene ricalcolata al massimo ogni 60s per
// veicolo: evita di pagare/chiamare l'API ad ogni singolo aggiornamento GPS
// per un dato che in pratica non cambia in modo percepibile in 12 secondi.
const ETA_REFRESH_MS = 60_000;

export default function CustomerHomeScreen() {
  const { profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<VehicleLocation[]>([]);
  const [etaByVehicle, setEtaByVehicle] = useState<Record<string, number | null>>({});
  const lastEtaFetchRef = useRef<Record<string, number>>({});

  useEffect(() => {
    listActiveVehicles().then(setVehicles).catch(() => {});
    const unsub = subscribeToVehicleLocations(setLocations);
    return unsub;
  }, []);

  useEffect(() => {
    const now = Date.now();
    locations.forEach((loc) => {
      const lastFetch = lastEtaFetchRef.current[loc.vehicleId] ?? 0;
      if (now - lastFetch < ETA_REFRESH_MS) return;
      lastEtaFetchRef.current[loc.vehicleId] = now;

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

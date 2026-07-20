import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { subscribeToVehicleLocations } from "@/services/locationService";
import { listActiveVehicles } from "@/services/vehicleService";
import type { Vehicle, VehicleLocation } from "@/types";

let MapView: any;
let VehicleMarkerComp: any;
if (Platform.OS !== "web") {
  // react-native-maps non supporta il web: caricato solo su iOS/Android.
  MapView = require("react-native-maps").default;
  VehicleMarkerComp = require("@/components/VehicleMarker").VehicleMarker;
}

export default function CustomerHomeScreen() {
  const { profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<VehicleLocation[]>([]);

  useEffect(() => {
    listActiveVehicles().then(setVehicles).catch(() => {});
    const unsub = subscribeToVehicleLocations(setLocations);
    return unsub;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Ciao{profile?.nome ? `, ${profile.nome}` : ""} 👋</Text>
      <Text style={styles.subtitle}>Dove vuoi andare oggi?</Text>

      <View style={styles.mapWrap}>
        {Platform.OS === "web" || !MapView ? (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackText}>
              Mappa disponibile su iOS/Android.{"\n"}Veicoli attivi: {vehicles.length}
            </Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={{ latitude: 41.3, longitude: 13.03, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          >
            {vehicles.map((v) => {
              const loc = locations.find((l) => l.vehicleId === v.id);
              return loc ? <VehicleMarkerComp key={v.id} vehicle={v} location={loc} /> : null;
            })}
          </MapView>
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Prenota un posto" onPress={() => router.push("/(customer)/route-selection")} />
        <PrimaryButton
          label="Le mie prenotazioni"
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
  map: { flex: 1 },
  mapFallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  mapFallbackText: { textAlign: "center", color: colors.muted },
  actions: { gap: spacing.sm },
});

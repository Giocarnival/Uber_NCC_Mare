import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../constants/theme";
import type { Vehicle, VehicleLocation } from "../types";

interface Props {
  vehicles: Vehicle[];
  locations: VehicleLocation[];
  etaByVehicle: Record<string, number | null>;
}

const statusColor: Record<string, string> = {
  available: colors.success,
  busy: colors.warning,
  offline: colors.muted,
};

export function VehicleMapView({ vehicles, locations, etaByVehicle }: Props) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!apiKey) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          Configura EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env per visualizzare la mappa.{"\n"}
          Veicoli attivi: {vehicles.length}
        </Text>
      </View>
    );
  }

  const selectedVehicle = vehicles.find((v) => v.id === selectedId);
  const selectedLocation = selectedId ? locations.find((l) => l.vehicleId === selectedId) : undefined;

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={{ lat: 41.3, lng: 13.03 }}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {vehicles.map((v) => {
          const loc = locations.find((l) => l.vehicleId === v.id);
          if (!loc) return null;
          const rotation = loc.heading ?? 0;
          return (
            <AdvancedMarker
              key={v.id}
              position={{ lat: loc.lat, lng: loc.lng }}
              onClick={() => setSelectedId(v.id)}
            >
              <View
                style={[
                  styles.pin,
                  { backgroundColor: statusColor[v.stato] ?? colors.sea, transform: [{ rotate: `${rotation}deg` }] },
                ]}
              >
                <Ionicons name="car-sport" size={20} color={colors.white} />
              </View>
            </AdvancedMarker>
          );
        })}

        {selectedVehicle && selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedId(null)}
          >
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{selectedVehicle.nome}</Text>
              <Text style={styles.calloutMeta}>{selectedVehicle.targa}</Text>
              {typeof etaByVehicle[selectedVehicle.id] === "number" && (
                <Text style={styles.calloutEta}>
                  ETA fermata più vicina: {etaByVehicle[selectedVehicle.id]} min
                </Text>
              )}
            </View>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  fallbackText: { textAlign: "center", color: colors.muted },
  pin: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  callout: { minWidth: 140, padding: 4, gap: 2 },
  calloutTitle: { fontWeight: "800", color: colors.ink, fontSize: typography.body.fontSize },
  calloutMeta: { color: colors.muted, fontSize: 12 },
  calloutEta: { color: colors.seaDark, fontWeight: "700", fontSize: 12, marginTop: 4 },
});

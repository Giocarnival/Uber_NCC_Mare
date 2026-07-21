import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../constants/theme";
import type { Vehicle, VehicleLocation } from "../types";

interface Props {
  vehicle: Vehicle;
  location: VehicleLocation;
  etaMinutes?: number | null;
}

const statusColor: Record<string, string> = {
  available: colors.success,
  busy: colors.warning,
  offline: colors.muted,
};

export const VehicleMarker = memo(function VehicleMarker({ vehicle, location, etaMinutes }: Props) {
  return (
    <Marker
      coordinate={{ latitude: location.lat, longitude: location.lng }}
      rotation={location.heading ?? 0}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
    >
      <View style={[styles.pin, { backgroundColor: statusColor[vehicle.stato] ?? colors.sea }]}>
        <Ionicons name="car-sport" size={20} color={colors.white} />
      </View>
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>{vehicle.nome}</Text>
          <Text style={styles.calloutMeta}>{vehicle.targa}</Text>
          {typeof etaMinutes === "number" && (
            <Text style={styles.calloutEta}>ETA fermata più vicina: {etaMinutes} min</Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
});

const styles = StyleSheet.create({
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
  calloutTitle: { fontWeight: "800", color: colors.ink },
  calloutMeta: { color: colors.muted, fontSize: 12 },
  calloutEta: { color: colors.seaDark, fontWeight: "700", fontSize: 12, marginTop: 4 },
});

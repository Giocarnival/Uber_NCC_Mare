import { View, Text, StyleSheet } from "react-native";
import { Marker, Callout } from "react-native-maps";
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

export function VehicleMarker({ vehicle, location, etaMinutes }: Props) {
  return (
    <Marker coordinate={{ latitude: location.lat, longitude: location.lng }}>
      <View style={[styles.pin, { backgroundColor: statusColor[vehicle.stato] ?? colors.sea }]}>
        <Text style={styles.pinLabel}>{vehicle.nome.replace("Vito ", "V")}</Text>
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
}

const styles = StyleSheet.create({
  pin: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  pinLabel: { color: colors.white, fontWeight: "800", fontSize: 12 },
  callout: { minWidth: 140, padding: 4, gap: 2 },
  calloutTitle: { fontWeight: "800", color: colors.ink },
  calloutMeta: { color: colors.muted, fontSize: 12 },
  calloutEta: { color: colors.seaDark, fontWeight: "700", fontSize: 12, marginTop: 4 },
});

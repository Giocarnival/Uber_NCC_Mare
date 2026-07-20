import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { colors, radius } from "../constants/theme";
import type { Vehicle, VehicleLocation } from "../types";

interface Props {
  vehicle: Vehicle;
  location: VehicleLocation;
}

const statusColor: Record<string, string> = {
  available: colors.success,
  busy: colors.warning,
  offline: colors.muted,
};

export function VehicleMarker({ vehicle, location }: Props) {
  return (
    <Marker
      coordinate={{ latitude: location.lat, longitude: location.lng }}
      title={vehicle.nome}
      description={vehicle.targa}
    >
      <View style={[styles.pin, { backgroundColor: statusColor[vehicle.stato] ?? colors.sea }]}>
        <Text style={styles.pinLabel}>{vehicle.nome.replace("Vito ", "V")}</Text>
      </View>
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
});

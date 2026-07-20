import { StyleSheet } from "react-native";
import MapView from "react-native-maps";
import { VehicleMarker } from "./VehicleMarker";
import type { Vehicle, VehicleLocation } from "../types";

interface Props {
  vehicles: Vehicle[];
  locations: VehicleLocation[];
  etaByVehicle: Record<string, number | null>;
}

export function VehicleMapView({ vehicles, locations, etaByVehicle }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{ latitude: 41.3, longitude: 13.03, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
    >
      {vehicles.map((v) => {
        const loc = locations.find((l) => l.vehicleId === v.id);
        return loc ? (
          <VehicleMarker key={v.id} vehicle={v} location={loc} etaMinutes={etaByVehicle[v.id]} />
        ) : null;
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});

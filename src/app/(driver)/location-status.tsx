import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getDriverByUserId, setDriverStatus } from "@/services/driverService";
import { reportVehicleLocation } from "@/services/locationService";

const REPORT_INTERVAL_MS = 12_000; // 10-15s come da capitolato §18/§19

export default function DriverLocationStatusScreen() {
  const { user } = useAuth();
  const [online, setOnline] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vehicleIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getDriverByUserId(user.uid).then((d) => {
      vehicleIdRef.current = d?.vehicleId ?? null;
    });
    return () => {
      void stopReporting();
    };
  }, [user]);

  async function startReporting() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const vehicleId = vehicleIdRef.current;
    if (!vehicleId) return;

    setOnline(true);
    if (user) await setDriverStatus(user.uid, "available");

    const tick = async () => {
      const loc = await Location.getCurrentPositionAsync({});
      setLastLocation(loc);
      await reportVehicleLocation(vehicleId, loc.coords.latitude, loc.coords.longitude);
    };
    await tick();
    intervalRef.current = setInterval(tick, REPORT_INTERVAL_MS);
  }

  async function stopReporting() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setOnline(false);
    if (user) await setDriverStatus(user.uid, "offline");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{online ? "Sei online" : "Sei offline"}</Text>
      <Text style={styles.subtitle}>
        {online
          ? "La tua posizione viene inviata ogni 10-15 secondi."
          : "Attiva la posizione per iniziare a ricevere corse."}
      </Text>

      {lastLocation && (
        <Text style={styles.coords}>
          {lastLocation.coords.latitude.toFixed(5)}, {lastLocation.coords.longitude.toFixed(5)}
        </Text>
      )}

      <PrimaryButton
        label={online ? "Vai offline" : "Vai online"}
        variant={online ? "danger" : "primary"}
        onPress={online ? stopReporting : startReporting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center", alignItems: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, textAlign: "center" },
  coords: { color: colors.seaDark, fontWeight: "700" },
});

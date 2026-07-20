import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getDriverByUserId, setDriverStatus } from "@/services/driverService";
import { listVehicles } from "@/services/vehicleService";
import type { Driver, DriverStatus, Vehicle } from "@/types";

const statusOptions: DriverStatus[] = ["offline", "available", "busy"];
const statusLabel: Record<DriverStatus, string> = {
  offline: "Offline",
  available: "Disponibile",
  busy: "In corsa",
};

export default function DriverDashboardScreen() {
  const { user, profile } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!user) return;
    getDriverByUserId(user.uid).then(async (d) => {
      setDriver(d);
      if (d?.vehicleId) {
        const vehicles = await listVehicles();
        setVehicle(vehicles.find((v) => v.id === d.vehicleId) ?? null);
      }
    });
  }, [user]);

  async function handleStatusChange(next: DriverStatus) {
    if (!driver) return;
    await setDriverStatus(driver.id, next);
    setDriver({ ...driver, stato: next });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Ciao{profile?.nome ? `, ${profile.nome}` : ""}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Veicolo assegnato</Text>
        <Text style={styles.cardValue}>{vehicle ? `${vehicle.nome} · ${vehicle.targa}` : "Nessun veicolo assegnato"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Stato servizio</Text>
        <View style={styles.statusRow}>
          {statusOptions.map((s) => (
            <PrimaryButton
              key={s}
              label={statusLabel[s]}
              variant={driver?.stato === s ? "primary" : "secondary"}
              onPress={() => handleStatusChange(s)}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Corse di oggi" onPress={() => router.push("/(driver)/trips")} />
        <PrimaryButton
          label="Posizione GPS"
          variant="secondary"
          onPress={() => router.push("/(driver)/location-status")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  greeting: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  cardLabel: { color: colors.muted, fontSize: typography.caption.fontSize },
  cardValue: { color: colors.ink, fontWeight: "700", fontSize: typography.body.fontSize },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actions: { gap: spacing.sm, marginTop: "auto" },
});

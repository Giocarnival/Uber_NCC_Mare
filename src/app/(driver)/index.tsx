import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useDriverDuty } from "@/context/DriverDutyContext";
import { getDriverByUserId } from "@/services/driverService";
import { listVehicles } from "@/services/vehicleService";
import type { Driver, Vehicle } from "@/types";

export default function DriverDashboardScreen() {
  const { user, profile } = useAuth();
  const { onDuty, starting, lastLocation, permissionDenied, startDuty, endDuty } = useDriverDuty();
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

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Ciao{profile?.nome ? `, ${profile.nome}` : ""}</Text>

      <View style={[styles.card, styles.rowCard]}>
        <Ionicons name="car-outline" size={22} color={colors.seaDark} />
        <View>
          <Text style={styles.cardLabel}>Veicolo assegnato</Text>
          <Text style={styles.cardValue}>{vehicle ? `${vehicle.nome} · ${vehicle.targa}` : "Nessun veicolo assegnato"}</Text>
        </View>
      </View>

      <View style={[styles.card, styles.dutyCard]}>
        <Ionicons
          name={onDuty ? "navigate-circle" : "navigate-circle-outline"}
          size={22}
          color={onDuty ? colors.success : colors.muted}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>Stato servizio</Text>
          <Text style={styles.cardValue}>{onDuty ? "In servizio — posizione condivisa" : "Non in servizio"}</Text>
          {onDuty && lastLocation && (
            <Text style={styles.coords}>
              {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
            </Text>
          )}
          {permissionDenied && (
            <Text style={styles.error}>Permesso posizione negato: abilitalo nelle impostazioni del telefono.</Text>
          )}
        </View>
      </View>

      <PrimaryButton
        label={onDuty ? "Termina servizio" : "Inizia servizio"}
        icon={onDuty ? "stop-circle-outline" : "play-circle-outline"}
        variant={onDuty ? "danger" : "primary"}
        loading={starting}
        disabled={!vehicle}
        onPress={onDuty ? endDuty : startDuty}
      />
      {!vehicle && <Text style={styles.hint}>Un amministratore deve assegnarti un veicolo prima di iniziare.</Text>}

      <View style={styles.actions}>
        <PrimaryButton
          label="Scansiona QR biglietto"
          icon="qr-code-outline"
          variant="accent"
          disabled={!onDuty}
          onPress={() => router.push("/(driver)/qr-scan" as any)}
        />
        <PrimaryButton
          label="Corse di oggi"
          icon="today-outline"
          variant="secondary"
          onPress={() => router.push("/(driver)/trips")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  greeting: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  rowCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dutyCard: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  dutyDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  cardLabel: { color: colors.muted, fontSize: typography.caption.fontSize },
  cardValue: { color: colors.ink, fontWeight: "700", fontSize: typography.body.fontSize },
  coords: { color: colors.seaDark, fontWeight: "600", fontSize: typography.caption.fontSize, marginTop: 4 },
  error: { color: colors.danger, fontSize: typography.caption.fontSize, marginTop: 4 },
  hint: { color: colors.muted, fontSize: typography.caption.fontSize, textAlign: "center" },
  actions: { gap: spacing.sm, marginTop: "auto" },
});

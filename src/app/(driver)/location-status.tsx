import { View, Text, StyleSheet } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { useDriverDuty } from "@/context/DriverDutyContext";

export default function DriverLocationStatusScreen() {
  const { onDuty, starting, lastLocation, permissionDenied, startDuty, endDuty } = useDriverDuty();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{onDuty ? "In servizio" : "Non in servizio"}</Text>
      <Text style={styles.subtitle}>
        {onDuty
          ? "La tua posizione viene inviata ogni 10-15 secondi finché non termini il servizio."
          : "Premi Inizia servizio quando arrivi allo stallo di partenza."}
      </Text>

      {lastLocation && (
        <Text style={styles.coords}>
          {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
        </Text>
      )}
      {permissionDenied && (
        <Text style={styles.error}>Permesso posizione negato: abilitalo nelle impostazioni del telefono.</Text>
      )}

      <PrimaryButton
        label={onDuty ? "Termina servizio" : "Inizia servizio"}
        variant={onDuty ? "danger" : "primary"}
        loading={starting}
        onPress={onDuty ? endDuty : startDuty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center", alignItems: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, textAlign: "center" },
  coords: { color: colors.seaDark, fontWeight: "700" },
  error: { color: colors.danger, textAlign: "center" },
});

import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { getAdminSettings, updateAdminSettings } from "@/services/adminSettingsService";

export default function AdminPricingScreen() {
  const [prezzoSingola, setPrezzoSingola] = useState("4");
  const [prezzoAR, setPrezzoAR] = useState("7");
  const [maxPassengers, setMaxPassengers] = useState("8");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSettings().then((s) => {
      setPrezzoSingola(String(s.prezzoSingola));
      setPrezzoAR(String(s.prezzoAR));
      setMaxPassengers(String(s.maxPassengersPerBooking));
      setCancellationPolicy(s.cancellationPolicy);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateAdminSettings({
        prezzoSingola: Number(prezzoSingola) || 0,
        prezzoAR: Number(prezzoAR) || 0,
        maxPassengersPerBooking: Number(maxPassengers) || 8,
        cancellationPolicy,
      });
      Alert.alert("Salvato", "Le tariffe sono state aggiornate.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Corsa singola (€)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={prezzoSingola} onChangeText={setPrezzoSingola} />

      <Text style={styles.label}>Andata e ritorno (€)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={prezzoAR} onChangeText={setPrezzoAR} />

      <Text style={styles.label}>Max passeggeri per prenotazione</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={maxPassengers} onChangeText={setMaxPassengers} />

      <Text style={styles.label}>Policy di cancellazione</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        value={cancellationPolicy}
        onChangeText={setCancellationPolicy}
      />

      <PrimaryButton label="Salva tariffe" onPress={handleSave} loading={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  label: { fontWeight: "700", color: colors.ink, marginTop: spacing.sm, fontSize: typography.caption.fontSize },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
});

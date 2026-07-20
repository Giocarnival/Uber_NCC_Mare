import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listDrivers, createDriver, updateDriver } from "@/services/driverService";
import { listVehicles } from "@/services/vehicleService";
import type { Driver, Vehicle } from "@/types";

export default function AdminDriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setDrivers(await listDrivers());
    setVehicles(await listVehicles());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!nome || !cognome || !email) {
      Alert.alert("Dati mancanti", "Inserisci nome, cognome ed email.");
      return;
    }
    setSaving(true);
    try {
      await createDriver({ nome, cognome, telefono, email, vehicleId: null, stato: "offline" });
      setNome("");
      setCognome("");
      setTelefono("");
      setEmail("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function assignVehicle(driver: Driver, vehicleId: string) {
    await updateDriver(driver.id, { vehicleId });
    await load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={colors.muted} value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Cognome" placeholderTextColor={colors.muted} value={cognome} onChangeText={setCognome} />
        <TextInput style={styles.input} placeholder="Telefono" placeholderTextColor={colors.muted} value={telefono} onChangeText={setTelefono} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} />
        <PrimaryButton label="Aggiungi autista" onPress={handleAdd} loading={saving} />
      </View>

      <FlatList
        data={drivers}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome} {item.cognome}</Text>
            <Text style={styles.cardMeta}>{item.email} · {item.stato}</Text>
            <View style={styles.vehicleRow}>
              {vehicles.map((v) => (
                <PrimaryButton
                  key={v.id}
                  label={v.nome}
                  variant={item.vehicleId === v.id ? "primary" : "secondary"}
                  onPress={() => assignVehicle(item, v.id)}
                />
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessun autista registrato.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  form: { gap: spacing.sm },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardTitle: { fontWeight: "800", color: colors.ink },
  cardMeta: { color: colors.muted, fontSize: typography.caption.fontSize },
  vehicleRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listDrivers, updateDriver } from "@/services/driverService";
import { createStaffAccount } from "@/services/authService";
import { listVehicles } from "@/services/vehicleService";
import type { Driver, Vehicle } from "@/types";

export default function AdminDriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setDrivers(await listDrivers());
    setVehicles(await listVehicles());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!nome || !cognome || !email || !password) {
      Alert.alert("Dati mancanti", "Inserisci nome, cognome, email e una password temporanea.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password troppo corta", "Usa almeno 6 caratteri.");
      return;
    }
    setSaving(true);
    try {
      await createStaffAccount({ nome, cognome, telefono, email, password, ruolo: "driver" });
      setNome("");
      setCognome("");
      setTelefono("");
      setEmail("");
      setPassword("");
      await load();
      Alert.alert("Autista creato", `Comunica all'autista email e password per il primo accesso.`);
    } catch (err: any) {
      Alert.alert("Creazione non riuscita", err?.message ?? "Riprova.");
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
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password temporanea" placeholderTextColor={colors.muted} secureTextEntry value={password} onChangeText={setPassword} />
        <PrimaryButton label="Crea account autista" onPress={handleAdd} loading={saving} />
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

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listVehicles, createVehicle, setVehicleStatus } from "@/services/vehicleService";
import type { Vehicle } from "@/types";

export default function AdminVehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [nome, setNome] = useState("");
  const [targa, setTarga] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setVehicles(await listVehicles());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!nome || !targa) {
      Alert.alert("Dati mancanti", "Inserisci nome e targa.");
      return;
    }
    setSaving(true);
    try {
      await createVehicle({
        nome,
        targa,
        postiTotali: 9,
        postiVendibili: 8,
        stato: "active",
        posizioneCorrente: null,
        driverId: null,
      });
      setNome("");
      setTarga("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(v: Vehicle) {
    const next = v.stato === "active" ? "inactive" : "active";
    await setVehicleStatus(v.id, next);
    await load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome (es. Vito 1)" placeholderTextColor={colors.muted} value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Targa" placeholderTextColor={colors.muted} value={targa} onChangeText={setTarga} />
        <PrimaryButton label="Aggiungi veicolo" onPress={handleAdd} loading={saving} />
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardMeta}>
                {item.targa} · {item.postiVendibili}/{item.postiTotali} posti · {item.stato}
              </Text>
            </View>
            <PrimaryButton
              label={item.stato === "active" ? "Disattiva" : "Attiva"}
              variant="secondary"
              onPress={() => toggleStatus(item)}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessun veicolo registrato.</Text>}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: { fontWeight: "800", color: colors.ink },
  cardMeta: { color: colors.muted, marginTop: 2, fontSize: typography.caption.fontSize },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});

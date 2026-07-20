import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listActiveRoutes, createRoute, updateRoute } from "@/services/routeService";
import type { Route } from "@/types";

export default function AdminRoutesScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [nome, setNome] = useState("");
  const [origine, setOrigine] = useState("");
  const [destinazione, setDestinazione] = useState("");
  const [distanzaKm, setDistanzaKm] = useState("5");
  const [durata, setDurata] = useState("12");
  const [saving, setSaving] = useState(false);

  async function load() {
    setRoutes(await listActiveRoutes());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!nome || !origine || !destinazione) {
      Alert.alert("Dati mancanti", "Compila nome, origine e destinazione.");
      return;
    }
    setSaving(true);
    try {
      await createRoute({
        nome,
        origine,
        destinazione,
        distanzaKm: Number(distanzaKm) || 0,
        durataStimataMinuti: Number(durata) || 0,
        active: true,
      });
      setNome("");
      setOrigine("");
      setDestinazione("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(route: Route) {
    await updateRoute(route.id, { active: !route.active });
    await load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome tratta" placeholderTextColor={colors.muted} value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Origine" placeholderTextColor={colors.muted} value={origine} onChangeText={setOrigine} />
        <TextInput style={styles.input} placeholder="Destinazione" placeholderTextColor={colors.muted} value={destinazione} onChangeText={setDestinazione} />
        <TextInput style={styles.input} placeholder="Distanza (km)" placeholderTextColor={colors.muted} keyboardType="numeric" value={distanzaKm} onChangeText={setDistanzaKm} />
        <TextInput style={styles.input} placeholder="Durata stimata (min)" placeholderTextColor={colors.muted} keyboardType="numeric" value={durata} onChangeText={setDurata} />
        <PrimaryButton label="Aggiungi tratta" onPress={handleAdd} loading={saving} />
      </View>

      <FlatList
        data={routes}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{item.origine} → {item.destinazione}</Text>
              <Text style={styles.cardMeta}>{item.distanzaKm} km · ~{item.durataStimataMinuti} min · {item.active ? "attiva" : "disattiva"}</Text>
            </View>
            <PrimaryButton label={item.active ? "Disattiva" : "Attiva"} variant="secondary" onPress={() => toggleActive(item)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessuna tratta configurata.</Text>}
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

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { listActiveRoutes } from "@/services/routeService";
import { listVehicles } from "@/services/vehicleService";
import { generateDailySlots, listTimeSlotsForDate, updateTimeSlot } from "@/services/timeSlotService";
import { todayISO } from "@/utils/dateUtils";
import type { Route, TimeSlot, Vehicle } from "@/types";

export default function AdminTimeSlotsScreen() {
  const [data, setData] = useState(todayISO());
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [generating, setGenerating] = useState(false);

  async function load() {
    const [r, v, s] = await Promise.all([listActiveRoutes(), listVehicles(), listTimeSlotsForDate(data)]);
    setRoutes(r);
    setVehicles(v);
    setSlots(s);
  }

  useEffect(() => {
    load();
  }, [data]);

  async function handleGenerate() {
    const andata = routes.find((r) => r.origine.toLowerCase().includes("sabaudia"));
    const ritorno = routes.find((r) => r.origine.toLowerCase().includes("lungomare"));
    if (!andata || !ritorno) {
      Alert.alert("Tratte mancanti", "Crea prima le due tratte (andata e ritorno) nella sezione Tratte.");
      return;
    }
    if (vehicles.length < 2) {
      Alert.alert("Veicoli mancanti", "Servono almeno 2 veicoli attivi nella sezione Veicoli.");
      return;
    }
    setGenerating(true);
    try {
      const count = await generateDailySlots({
        data,
        routeAndataId: andata.id,
        routeRitornoId: ritorno.id,
        vehicleIds: [vehicles[0].id, vehicles[1].id],
        postiVendibili: vehicles[0].postiVendibili,
      });
      Alert.alert("Slot generati", `${count} slot creati per il ${data}.`);
      await load();
    } finally {
      setGenerating(false);
    }
  }

  async function toggleSlot(slot: TimeSlot) {
    await updateTimeSlot(slot.id, { active: !slot.active });
    await load();
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.muted}
        value={data}
        onChangeText={setData}
      />
      <PrimaryButton label="Genera slot per questa data" onPress={handleGenerate} loading={generating} />

      <FlatList
        data={slots}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ gap: spacing.sm, marginTop: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{item.oraPartenza}</Text>
              <Text style={styles.cardMeta}>{item.postiDisponibili} posti · {item.active ? "attivo" : "disattivo"}</Text>
            </View>
            <PrimaryButton label={item.active ? "Disattiva" : "Attiva"} variant="secondary" onPress={() => toggleSlot(item)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessuno slot per questa data.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
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
  },
  cardTitle: { fontWeight: "800", color: colors.ink },
  cardMeta: { color: colors.muted, marginTop: 2, fontSize: typography.caption.fontSize },
  empty: { color: colors.muted, textAlign: "center" },
});

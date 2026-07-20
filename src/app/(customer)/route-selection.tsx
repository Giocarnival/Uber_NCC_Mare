import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Switch } from "react-native";
import { router } from "expo-router";
import { RouteCard } from "@/components/RouteCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { listActiveRoutes } from "@/services/routeService";
import type { Route } from "@/types";

export default function RouteSelectionScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [andataERitorno, setAndataERitorno] = useState(false);

  useEffect(() => {
    listActiveRoutes().then(setRoutes).catch(() => {});
  }, []);

  function handleContinue() {
    if (!selectedId) return;
    router.push({
      pathname: "/(customer)/time-slot-selection",
      params: { routeId: selectedId, andataERitorno: andataERitorno ? "1" : "0" },
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <RouteCard route={item} selected={item.id === selectedId} onPress={() => setSelectedId(item.id)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nessuna tratta disponibile al momento.</Text>}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Andata e ritorno</Text>
        <Switch value={andataERitorno} onValueChange={setAndataERitorno} trackColor={{ true: colors.sea }} />
      </View>

      <PrimaryButton label="Continua" onPress={handleContinue} disabled={!selectedId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  toggleLabel: { fontSize: typography.body.fontSize, color: colors.ink, fontWeight: "600" },
});

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import type { Ionicons } from "@expo/vector-icons";
import { AdminStatCard } from "@/components/AdminStatCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { computeDailyReport } from "@/services/reportService";
import { todayISO } from "@/utils/dateUtils";
import type { DailyReport } from "@/services/reportService";

const menu: Array<{ label: string; href: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: "Veicoli", href: "/(admin)/vehicles", icon: "car-outline" },
  { label: "Autisti", href: "/(admin)/drivers", icon: "people-outline" },
  { label: "Tratte", href: "/(admin)/routes", icon: "map-outline" },
  { label: "Orari", href: "/(admin)/timeslots", icon: "time-outline" },
  { label: "Prezzi", href: "/(admin)/pricing", icon: "pricetag-outline" },
  { label: "Prenotazioni", href: "/(admin)/bookings", icon: "clipboard-outline" },
  { label: "Report", href: "/(admin)/reports", icon: "bar-chart-outline" },
];

export default function AdminDashboardScreen() {
  const [report, setReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    computeDailyReport(todayISO()).then(setReport).catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard di oggi</Text>
      <View style={styles.statsRow}>
        <AdminStatCard label="Incasso oggi" value={`${(report?.incasso ?? 0).toFixed(2)} €`} />
        <AdminStatCard label="Posti venduti" value={String(report?.passeggeri ?? 0)} />
      </View>
      <View style={styles.statsRow}>
        <AdminStatCard label="Corse" value={String(report?.corse ?? 0)} />
        <AdminStatCard
          label="Riempimento medio"
          value={`${((report?.tassoRiempimentoMedio ?? 0) * 100).toFixed(0)}%`}
        />
      </View>

      <Text style={[styles.title, { marginTop: spacing.lg }]}>Gestione</Text>
      <View style={styles.menu}>
        {menu.map((m) => (
          <PrimaryButton
            key={m.href}
            label={m.label}
            icon={m.icon}
            variant="secondary"
            onPress={() => router.push(m.href as any)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  menu: { gap: spacing.sm },
});

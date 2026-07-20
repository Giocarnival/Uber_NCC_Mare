import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { AdminStatCard } from "@/components/AdminStatCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { computeDailyReport } from "@/services/reportService";
import { todayISO } from "@/utils/dateUtils";
import type { DailyReport } from "@/services/reportService";

const menu = [
  { label: "Veicoli", href: "/(admin)/vehicles" },
  { label: "Autisti", href: "/(admin)/drivers" },
  { label: "Tratte", href: "/(admin)/routes" },
  { label: "Orari", href: "/(admin)/timeslots" },
  { label: "Prezzi", href: "/(admin)/pricing" },
  { label: "Prenotazioni", href: "/(admin)/bookings" },
  { label: "Report", href: "/(admin)/reports" },
] as const;

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
          <PrimaryButton key={m.href} label={m.label} variant="secondary" onPress={() => router.push(m.href as any)} />
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

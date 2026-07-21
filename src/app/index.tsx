import { View, Text, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { dashboardRouteForRole } from "@/services/authService";

/**
 * Home screen: se l'utente ha già una sessione attiva viene reindirizzato
 * direttamente alla sua dashboard, altrimenti sceglie il ruolo con cui
 * accedere (capitolato §12 "Home Page"). Il logo compare già nell'header
 * (vedi _layout.tsx): qui usiamo lo spazio per la foto di benvenuto.
 */
export default function Home() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(dashboardRouteForRole(profile.ruolo) as any);
    }
  }, [loading, user, profile]);

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/hero-van-1.png")} style={styles.hero} resizeMode="cover" />
      <Text style={styles.title}>Sabaudia Shuttle</Text>
      <Text style={styles.subtitle}>Sabaudia Centro ⇄ Lungomare, prenota il tuo posto</Text>

      <View style={styles.actions}>
        <PrimaryButton
          label="Sono un cliente"
          icon="person-outline"
          onPress={() => router.push("/(auth)/login?role=customer" as any)}
        />
        <PrimaryButton
          label="Sono un autista"
          icon="car-outline"
          variant="secondary"
          onPress={() => router.push("/(auth)/login?role=driver" as any)}
        />
        <PrimaryButton
          label="Area amministratore"
          icon="shield-checkmark-outline"
          variant="secondary"
          onPress={() => router.push("/(auth)/login?role=admin" as any)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: spacing.lg, gap: spacing.md },
  hero: { width: "100%", height: 180, borderRadius: radius.lg, marginTop: spacing.sm },
  title: { fontSize: typography.title.fontSize, fontWeight: "800", color: colors.seaDark, marginTop: spacing.sm },
  subtitle: { fontSize: typography.body.fontSize, color: colors.muted, textAlign: "center" },
  actions: { width: "100%", maxWidth: 360, gap: spacing.md, marginTop: spacing.lg },
});

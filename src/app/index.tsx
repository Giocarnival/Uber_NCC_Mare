import { View, Text, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { dashboardRouteForRole } from "@/services/authService";

/**
 * Home screen: se l'utente ha già una sessione attiva viene reindirizzato
 * direttamente alla sua dashboard, altrimenti sceglie il ruolo con cui
 * accedere (capitolato §12 "Home Page").
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
      <Image source={require("@/assets/images/logo.png")} style={styles.logoImage} resizeMode="contain" />
      <Text style={styles.logo}>Sabaudia Shuttle</Text>
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
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  logoImage: { width: 120, height: 102, marginBottom: spacing.sm },
  logo: { fontSize: typography.title.fontSize, fontWeight: "800", color: colors.seaDark },
  subtitle: { fontSize: typography.body.fontSize, color: colors.muted, textAlign: "center" },
  actions: { width: "100%", maxWidth: 360, gap: spacing.md, marginTop: spacing.lg },
});

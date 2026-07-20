import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams, Link } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { loginUser, getCurrentUserProfile, dashboardRouteForRole } from "@/services/authService";

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Dati mancanti", "Inserisci email e password.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      const profile = await getCurrentUserProfile(user.uid);
      if (!profile) {
        Alert.alert("Profilo non trovato", "Contatta l'assistenza.");
        return;
      }
      router.replace(dashboardRouteForRole(profile.ruolo) as any);
    } catch (err: any) {
      Alert.alert("Accesso non riuscito", err?.message ?? "Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accedi{role ? ` come ${role}` : ""}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PrimaryButton label="Accedi" onPress={handleLogin} loading={loading} />

      <View style={styles.links}>
        <Link href="/(auth)/register" style={styles.link}>
          Non hai un account? Registrati
        </Link>
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Password dimenticata?
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
  },
  links: { marginTop: spacing.lg, gap: spacing.sm, alignItems: "center" },
  link: { color: colors.sea, fontWeight: "600" },
});

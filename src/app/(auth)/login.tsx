import { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams, Link } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { loginUser, getCurrentUserProfile, dashboardRouteForRole } from "@/services/authService";

const roleLabel: Record<string, string> = {
  customer: "cliente",
  driver: "autista",
  admin: "amministratore",
};

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const canRegister = !role || role === "customer";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

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
      <Text style={styles.title}>Accedi{role ? ` come ${roleLabel[role] ?? role}` : ""}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
      />
      <TextInput
        ref={passwordRef}
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        returnKeyType="go"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleLogin}
      />

      <PrimaryButton label="Accedi" onPress={handleLogin} loading={loading} />

      <View style={styles.links}>
        {canRegister && (
          <Link href="/(auth)/register" style={styles.link}>
            Non hai un account? Registrati
          </Link>
        )}
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Password dimenticata?
        </Link>
        {!canRegister && (
          <Text style={styles.hint}>
            L'account {roleLabel[role!] ?? role} viene creato da un amministratore.
          </Text>
        )}
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
  hint: { color: colors.muted, fontSize: typography.caption.fontSize, textAlign: "center" },
});

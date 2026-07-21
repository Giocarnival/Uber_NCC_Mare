import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { requestPasswordReset } from "@/services/authService";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email) {
      Alert.alert("Email mancante", "Inserisci la tua email.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      Alert.alert("Email inviata", "Controlla la tua casella di posta per reimpostare la password.");
    } catch (err: any) {
      Alert.alert("Operazione non riuscita", err?.message ?? "Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupera la password</Text>
      <Text style={styles.subtitle}>Ti invieremo un link per reimpostarla.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="go"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={handleReset}
      />

      <PrimaryButton label="Invia link di recupero" onPress={handleReset} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
  },
});

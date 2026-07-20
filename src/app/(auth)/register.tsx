import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { registerCustomer } from "@/services/authService";

export default function RegisterScreen() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !cognome || !email || !password) {
      Alert.alert("Dati mancanti", "Compila tutti i campi obbligatori.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password troppo corta", "Usa almeno 6 caratteri.");
      return;
    }
    setLoading(true);
    try {
      await registerCustomer({ nome, cognome, email: email.trim(), telefono, password });
      router.replace("/(customer)" as any);
    } catch (err: any) {
      Alert.alert("Registrazione non riuscita", err?.message ?? "Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crea il tuo account</Text>

      <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={colors.muted} value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Cognome" placeholderTextColor={colors.muted} value={cognome} onChangeText={setCognome} />
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
        placeholder="Telefono"
        placeholderTextColor={colors.muted}
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PrimaryButton label="Registrati" onPress={handleRegister} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
  },
});

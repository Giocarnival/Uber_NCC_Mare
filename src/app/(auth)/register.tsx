import { useRef, useState } from "react";
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

  const cognomeRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const telefonoRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

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

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor={colors.muted}
        returnKeyType="next"
        value={nome}
        onChangeText={setNome}
        onSubmitEditing={() => cognomeRef.current?.focus()}
        blurOnSubmit={false}
      />
      <TextInput
        ref={cognomeRef}
        style={styles.input}
        placeholder="Cognome"
        placeholderTextColor={colors.muted}
        returnKeyType="next"
        value={cognome}
        onChangeText={setCognome}
        onSubmitEditing={() => emailRef.current?.focus()}
        blurOnSubmit={false}
      />
      <TextInput
        ref={emailRef}
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={() => telefonoRef.current?.focus()}
        blurOnSubmit={false}
      />
      <TextInput
        ref={telefonoRef}
        style={styles.input}
        placeholder="Telefono"
        placeholderTextColor={colors.muted}
        keyboardType="phone-pad"
        returnKeyType="next"
        value={telefono}
        onChangeText={setTelefono}
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
        onSubmitEditing={handleRegister}
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

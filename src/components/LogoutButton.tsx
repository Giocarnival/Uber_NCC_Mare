import { useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../constants/theme";
import { logoutUser } from "../services/authService";

/**
 * Non naviga esplicitamente dopo il logout: la navigazione verso "/" è
 * gestita in modo dichiarativo da <Redirect> nei layout di
 * customer/driver/admin, che si attiva appena l'utente diventa null.
 * Il timeout evita che il pulsante resti bloccato a ruotare all'infinito
 * se signOut() dovesse impiegare troppo (es. problemi di rete).
 */
export function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await Promise.race([
        logoutUser(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Il logout non ha risposto in tempo. Riprova.")), 8000)
        ),
      ]);
    } catch (err: any) {
      Alert.alert("Logout non riuscito", err?.message ?? "Riprova.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (loggingOut) {
    return <ActivityIndicator color={colors.white} style={styles.btn} />;
  }

  return (
    <Pressable onPress={handleLogout} hitSlop={8} style={styles.btn}>
      <Text style={styles.text}>Esci</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 8 },
  text: { color: colors.white, fontWeight: "700", fontSize: 15 },
});

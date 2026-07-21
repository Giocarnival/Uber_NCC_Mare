import { useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../constants/theme";
import { logoutUser } from "../services/authService";

/**
 * Non naviga esplicitamente dopo il logout: la navigazione verso "/" è
 * gestita da AuthGate nel layout root (src/app/_layout.tsx), che rileva la
 * transizione autenticato→non autenticato una sola volta. Il timeout evita
 * che il pulsante resti bloccato a ruotare all'infinito se signOut()
 * dovesse impiegare troppo (es. problemi di rete).
 */
export function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    console.log("[LogoutButton] pressed");
    setLoggingOut(true);
    try {
      await Promise.race([
        logoutUser(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Il logout non ha risposto in tempo. Riprova.")), 8000)
        ),
      ]);
      console.log("[LogoutButton] signOut resolved");
    } catch (err: any) {
      console.log("[LogoutButton] signOut error", err?.message ?? err);
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

import { useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../constants/theme";
import { logoutUser } from "../services/authService";

/**
 * Non naviga esplicitamente dopo il logout: la navigazione verso "/" è
 * gestita in modo reattivo da useRequireAuth() nel layout del gruppo
 * (customer/driver/admin), che si attiva non appena l'utente diventa null.
 * Farla anche qui creava una doppia navigazione in corsa con quella
 * reattiva, causando un errore di navigazione intermittente.
 */
export function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
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

import { useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import { colors } from "../constants/theme";
import { logoutUser } from "../services/authService";

/**
 * Su web, dopo signOut() forziamo una navigazione reale del browser verso
 * "/" (window.location.href) invece di affidarci alla navigazione interna
 * di Expo Router: sul web quest'ultima sincronizza la schermata con l'URL
 * del browser, quindi anche rimontando l'intero albero di navigazione (via
 * key) la pagina mostrata torna a derivare dallo stesso URL non cambiato,
 * mostrando di nuovo la schermata precedente. Un cambio reale della pagina
 * bypassa del tutto questo comportamento. Su nativo (iOS/Android) non c'è
 * un URL di pagina: lì la navigazione dopo il logout è gestita dal cambio
 * di `key` in AppNavigator (src/app/_layout.tsx).
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
      if (Platform.OS === "web") {
        window.location.href = "/";
      }
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

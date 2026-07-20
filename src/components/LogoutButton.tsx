import { Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors } from "../constants/theme";
import { logoutUser } from "../services/authService";

export function LogoutButton() {
  async function handleLogout() {
    await logoutUser();
    router.replace("/");
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

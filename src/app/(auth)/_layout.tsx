import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.sea },
        headerTintColor: colors.white,
        contentStyle: { backgroundColor: colors.sand },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Accedi" }} />
      <Stack.Screen name="register" options={{ title: "Registrati" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Recupera password" }} />
    </Stack>
  );
}

import { Stack } from "expo-router";
import { colors } from "@/constants/theme";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitle: (props) => <AppHeaderTitle subtitle={props.children} />,
        contentStyle: { backgroundColor: colors.sand },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Accedi" }} />
      <Stack.Screen name="register" options={{ title: "Registrati" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Recupera password" }} />
    </Stack>
  );
}

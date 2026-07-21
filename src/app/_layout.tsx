import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { StripeRoot } from "@/components/StripeRoot";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <StripeRoot>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.sea },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: colors.sand },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Sabaudia Shuttle" }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen name="(driver)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </StripeRoot>
  );
}

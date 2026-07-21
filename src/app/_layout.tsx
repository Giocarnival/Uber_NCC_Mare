import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { StripeRoot } from "@/components/StripeRoot";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <StripeRoot>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.navy },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: "700" },
            headerTitle: (props) => <AppHeaderTitle subtitle={props.children} />,
            contentStyle: { backgroundColor: colors.sand },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen name="(driver)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </StripeRoot>
  );
}

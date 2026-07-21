import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { StripeRoot } from "@/components/StripeRoot";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";
import { colors } from "@/constants/theme";

/**
 * router.replace("/") chiamato dopo il logout non riesce a uscire dal
 * gruppo di navigazione annidato (customer/driver/admin) verso la root in
 * questa versione di Expo Router/React Navigation, nonostante venga
 * eseguito correttamente (verificato via log: la chiamata avviene, ma la
 * schermata visibile non cambia). Anziché continuare ad affidarsi alla
 * navigazione imperativa, usiamo la `key` di React sullo Stack: quando lo
 * stato di autenticazione cambia, la key cambia e React smonta e rimonta
 * da zero l'intero albero di navigazione, che riparte quindi sempre dalla
 * rotta iniziale "/". Meccanismo di React puro, non dipende da Expo Router.
 */
function AppNavigator() {
  const { user, loading } = useAuth();
  const navigatorKey = loading ? "loading" : user ? `auth-${user.uid}` : "anon";
  console.log("[AppNavigator] render, navigatorKey:", navigatorKey);

  return (
    <Stack
      key={navigatorKey}
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
  );
}

export default function RootLayout() {
  return (
    <StripeRoot>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </StripeRoot>
  );
}

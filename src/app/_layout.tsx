import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { StripeRoot } from "@/components/StripeRoot";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { colors } from "@/constants/theme";

/**
 * Su web, router.replace("/") dopo il logout non riesce a uscire dal
 * gruppo di navigazione annidato (customer/driver/admin) verso la root,
 * perché Expo Router sul web sincronizza la schermata con l'URL del
 * browser (vedi LogoutButton, che forza un window.location.href su web).
 * Qui, cambiando la `key` dello Stack in base allo stato di autenticazione,
 * forziamo comunque React a rimontare da zero l'intera navigazione: utile
 * soprattutto su nativo (iOS/Android), dove non esiste un URL di pagina.
 */
function AppNavigator() {
  const { user, loading } = useAuth();
  const navigatorKey = loading ? "loading" : user ? `auth-${user.uid}` : "anon";

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
    <ErrorBoundary>
      <StripeRoot>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </StripeRoot>
    </ErrorBoundary>
  );
}

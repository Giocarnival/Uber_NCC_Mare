import { useEffect } from "react";
import { Stack, router, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { StripeRoot } from "@/components/StripeRoot";
import { colors } from "@/constants/theme";

const PROTECTED_GROUPS = ["(customer)", "(driver)", "(admin)"];

/**
 * Riporta alla home quando l'utente non è più autenticato (es. dopo logout)
 * mentre si trova in un'area protetta. Vive nel layout root (non nei layout
 * annidati di customer/driver/admin) perché router.replace("/") chiamato da
 * dentro un navigatore annidato non raggiunge in modo affidabile lo Stack
 * root — qui non c'è ambiguità.
 */
function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!loading && !user && PROTECTED_GROUPS.includes(segments[0])) {
      router.replace("/");
    }
  }, [loading, user, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <StripeRoot>
      <AuthProvider>
        <AuthGate />
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

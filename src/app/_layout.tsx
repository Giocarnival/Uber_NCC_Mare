import { useEffect, useRef } from "react";
import { Stack, router } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { StripeRoot } from "@/components/StripeRoot";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";
import { colors } from "@/constants/theme";

/**
 * Riporta alla home esattamente nel momento in cui l'utente passa da
 * autenticato a non autenticato (logout). Il ref "wasAuthenticated" rende il
 * controllo "edge-triggered": scatta una volta sola sulla transizione, non
 * ad ogni render in cui "non c'è utente" è vero. Due tentativi precedenti
 * (router.replace in un layout annidato, poi <Redirect> dentro i layout
 * customer/driver/admin) si sono rivelati inaffidabili o hanno causato un
 * loop di render infinito: questo pattern evita entrambi i problemi.
 */
function AuthGate() {
  const { user, loading } = useAuth();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    console.log("[AuthGate]", { loading, hasUser: !!user, wasAuthenticated: wasAuthenticated.current });
    if (loading) return;
    if (user) {
      wasAuthenticated.current = true;
    } else if (wasAuthenticated.current) {
      wasAuthenticated.current = false;
      console.log("[AuthGate] logout detected, redirecting to /");
      router.replace("/");
    }
  }, [loading, user]);

  return null;
}

export default function RootLayout() {
  return (
    <StripeRoot>
      <AuthProvider>
        <AuthGate />
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

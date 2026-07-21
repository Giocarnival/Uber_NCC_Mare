import { Redirect, Stack } from "expo-router";
import { colors } from "@/constants/theme";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.sea },
        headerTintColor: colors.white,
        contentStyle: { backgroundColor: colors.sand },
        headerRight: () => <LogoutButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Pannello Admin" }} />
      <Stack.Screen name="vehicles" options={{ title: "Veicoli" }} />
      <Stack.Screen name="drivers" options={{ title: "Autisti" }} />
      <Stack.Screen name="routes" options={{ title: "Tratte" }} />
      <Stack.Screen name="timeslots" options={{ title: "Orari" }} />
      <Stack.Screen name="pricing" options={{ title: "Prezzi" }} />
      <Stack.Screen name="bookings" options={{ title: "Prenotazioni" }} />
      <Stack.Screen name="reports" options={{ title: "Report" }} />
    </Stack>
  );
}

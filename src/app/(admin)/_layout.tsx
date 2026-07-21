import { Stack } from "expo-router";
import { colors } from "@/constants/theme";
import { LogoutButton } from "@/components/LogoutButton";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitle: (props) => <AppHeaderTitle subtitle={props.children} />,
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

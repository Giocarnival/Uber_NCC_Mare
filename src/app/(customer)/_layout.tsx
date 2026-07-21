import { Stack } from "expo-router";
import { colors } from "@/constants/theme";
import { LogoutButton } from "@/components/LogoutButton";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";

export default function CustomerLayout() {
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
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="route-selection" options={{ title: "Scegli la tratta" }} />
      <Stack.Screen name="time-slot-selection" options={{ title: "Data e orario" }} />
      <Stack.Screen name="booking-summary" options={{ title: "Riepilogo" }} />
      <Stack.Screen name="payment" options={{ title: "Pagamento" }} />
      <Stack.Screen name="ticket" options={{ title: "Il tuo biglietto", headerBackVisible: false }} />
      <Stack.Screen name="my-bookings" options={{ title: "Le mie prenotazioni" }} />
    </Stack>
  );
}

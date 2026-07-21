import { Stack } from "expo-router";
import { colors } from "@/constants/theme";
import { LogoutButton } from "@/components/LogoutButton";
import { AppHeaderTitle } from "@/components/AppHeaderTitle";
import { DriverDutyProvider } from "@/context/DriverDutyContext";

export default function DriverLayout() {
  return (
    <DriverDutyProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerTitle: (props) => <AppHeaderTitle subtitle={props.children} />,
          contentStyle: { backgroundColor: colors.sand },
          headerRight: () => <LogoutButton />,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Autista" }} />
        <Stack.Screen name="trips" options={{ title: "Corse di oggi" }} />
        <Stack.Screen name="trip/[id]" options={{ title: "Dettaglio corsa" }} />
        <Stack.Screen name="location-status" options={{ title: "Stato e posizione" }} />
      </Stack>
    </DriverDutyProvider>
  );
}

import type { ReactNode } from "react";
import { Platform } from "react-native";

// @stripe/stripe-react-native è un modulo nativo senza build per il web:
// caricato dinamicamente solo su iOS/Android, come già fatto per react-native-maps.
let StripeProviderComp: any = ({ children }: { children: ReactNode }) => children;
if (Platform.OS !== "web") {
  StripeProviderComp = require("@stripe/stripe-react-native").StripeProvider;
}

export function StripeRoot({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") return <>{children}</>;

  return (
    <StripeProviderComp publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}>
      {children}
    </StripeProviderComp>
  );
}

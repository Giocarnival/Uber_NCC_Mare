import type { ReactElement } from "react";
import { StripeProvider } from "@stripe/stripe-react-native";

export function StripeRoot({ children }: { children: ReactElement }) {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}>
      {children}
    </StripeProvider>
  );
}

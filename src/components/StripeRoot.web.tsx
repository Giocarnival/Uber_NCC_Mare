import type { ReactNode } from "react";

// Il web usa questo file al posto di StripeRoot.tsx (convenzione Metro
// Component.web.tsx): evita di importare "@stripe/stripe-react-native", che
// è un modulo nativo privo di build web e romperebbe il bundle Metro anche
// se l'import fosse condizionato a runtime da Platform.OS.
export function StripeRoot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

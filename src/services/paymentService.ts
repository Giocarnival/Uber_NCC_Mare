import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

/**
 * Chiama la Cloud Function `createPaymentIntent` (vedi functions/src/payments.ts)
 * che crea un PaymentIntent Stripe lato server. Il client non gestisce mai
 * direttamente i dati della carta: quelli sono raccolti dallo Stripe SDK.
 */
export async function createPaymentIntent(params: {
  bookingId: string;
  amount: number; // in euro
}): Promise<CreatePaymentIntentResponse> {
  const callable = httpsCallable<typeof params, CreatePaymentIntentResponse>(
    functions,
    "createPaymentIntent"
  );
  const result = await callable(params);
  return result.data;
}

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import { db } from "./admin";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

/**
 * Crea un PaymentIntent Stripe per una prenotazione esistente (capitolato §17).
 * Il client non gestisce mai dati carta: li raccoglie lo Stripe SDK/PaymentSheet
 * usando il clientSecret restituito da questa funzione.
 */
export const createPaymentIntent = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Devi essere autenticato.");
    }
    const { bookingId } = request.data as { bookingId: string; amount?: number };
    if (!bookingId) {
      throw new HttpsError("invalid-argument", "bookingId mancante.");
    }

    const bookingSnap = await db.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      throw new HttpsError("not-found", "Prenotazione non trovata.");
    }
    const booking = bookingSnap.data()!;
    if (booking.userId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "Questa prenotazione non ti appartiene.");
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const amountCents = Math.round(booking.prezzoTotale * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      metadata: { bookingId },
    });

    const paymentRef = await db.collection("payments").add({
      bookingId,
      provider: "stripe",
      amount: booking.prezzoTotale,
      status: "requires_payment",
      createdAt: Date.now(),
      stripePaymentIntentId: paymentIntent.id,
    });

    return { clientSecret: paymentIntent.client_secret, paymentId: paymentRef.id };
  }
);

/**
 * Webhook Stripe: conferma lato server l'esito del pagamento e aggiorna
 * payments.status / bookings.stato di conseguenza (capitolato §17, §21:
 * "nessun dato carta nel database", "webhook per confermare lo stato").
 */
export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const stripe = new Stripe(stripeSecretKey.value());
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value());
    } catch (err) {
      res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`);
      return;
    }

    async function updateByPaymentIntent(paymentIntentId: string, status: "succeeded" | "failed") {
      const paymentsQuery = await db
        .collection("payments")
        .where("stripePaymentIntentId", "==", paymentIntentId)
        .limit(1)
        .get();
      if (paymentsQuery.empty) return;

      const paymentDoc = paymentsQuery.docs[0];
      await paymentDoc.ref.update({ status });

      const { bookingId } = paymentDoc.data();
      await db.collection("bookings").doc(bookingId).update({
        stato: status === "succeeded" ? "paid" : "cancelled",
        paymentId: paymentDoc.id,
      });
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await updateByPaymentIntent(intent.id, "succeeded");
        break;
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await updateByPaymentIntent(intent.id, "failed");
        break;
      }
      default:
        break;
    }

    res.status(200).send({ received: true });
  }
);

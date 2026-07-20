import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "./admin";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function sendExpoPush(messages: ExpoPushMessage[]) {
  if (messages.length === 0) return;
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(messages),
  });
}

async function getExpoPushToken(userId: string): Promise<string | null> {
  const snap = await db.collection("users").doc(userId).get();
  return (snap.data()?.expoPushToken as string | undefined) ?? null;
}

/**
 * Notifica il cliente quando il pagamento della prenotazione va a buon fine
 * (capitolato §20: "Cliente: conferma prenotazione").
 */
export const onBookingPaid = onDocumentUpdated("bookings/{bookingId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!before || !after) return;
  if (before.stato === after.stato || after.stato !== "paid") return;

  const token = await getExpoPushToken(after.userId);
  if (!token) return;

  await sendExpoPush([
    {
      to: token,
      title: "Prenotazione confermata",
      body: `La tua prenotazione ${after.bookingCode} è confermata. Buon viaggio!`,
      data: { bookingId: event.params.bookingId, type: "booking_confirmed" },
    },
  ]);
});

/**
 * Promemoria di partenza: gira ogni 15 minuti e avvisa i passeggeri delle
 * corse in partenza entro i prossimi 30-45 minuti (capitolato §20: "Cliente:
 * promemoria partenza"). Usa il flag `reminderSent` sullo slot per evitare
 * invii duplicati.
 */
export const sendTripReminders = onSchedule("every 15 minutes", async () => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const slotsSnap = await db
    .collection("timeSlots")
    .where("data", "==", today)
    .where("active", "==", true)
    .get();

  for (const slotDoc of slotsSnap.docs) {
    const slot = slotDoc.data();
    if (slot.reminderSent) continue;

    const [hh, mm] = String(slot.oraPartenza).split(":").map(Number);
    const departure = new Date(now);
    departure.setHours(hh, mm, 0, 0);
    const minutesUntilDeparture = (departure.getTime() - now.getTime()) / 60000;

    if (minutesUntilDeparture < 0 || minutesUntilDeparture > 30) continue;

    const bookingsSnap = await db
      .collection("bookings")
      .where("timeSlotId", "==", slotDoc.id)
      .where("stato", "==", "paid")
      .get();

    const tokens = (
      await Promise.all(bookingsSnap.docs.map((b) => getExpoPushToken(b.data().userId)))
    ).filter((t): t is string => Boolean(t));

    await sendExpoPush(
      tokens.map((to) => ({
        to,
        title: "La tua corsa parte tra poco",
        body: `Partenza alle ${slot.oraPartenza}. Preparati per la salita!`,
        data: { timeSlotId: slotDoc.id, type: "trip_reminder" },
      }))
    );

    await slotDoc.ref.update({ reminderSent: true });
  }
});

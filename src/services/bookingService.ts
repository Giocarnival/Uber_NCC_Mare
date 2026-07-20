import {
  collection,
  doc,
  runTransaction,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Booking, BookingStatus, TimeSlot } from "../types";
import { generateBookingCode } from "../utils/bookingCode";
import { calcolaPrezzo } from "../utils/priceCalculator";
import { getAdminSettings } from "./adminSettingsService";

const bookingsCol = collection(db, "bookings");

export interface CreateBookingParams {
  userId: string;
  routeId: string;
  timeSlotId: string;
  numeroPasseggeri: number;
  andataERitorno: boolean;
}

/**
 * Crea una prenotazione in stato "pending" riducendo atomicamente i posti
 * disponibili dello slot, per evitare overbooking in caso di richieste
 * concorrenti (capitolato §16).
 */
export async function createBooking(params: CreateBookingParams): Promise<Booking> {
  const { userId, routeId, timeSlotId, numeroPasseggeri, andataERitorno } = params;

  const slotRef = doc(db, "timeSlots", timeSlotId);
  const bookingRef = doc(bookingsCol);
  const settings = await getAdminSettings();

  const booking = await runTransaction(db, async (tx) => {
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists()) {
      throw new Error("Slot orario non trovato");
    }
    const slot = slotSnap.data() as TimeSlot;
    if (!slot.active) {
      throw new Error("Slot orario non disponibile");
    }
    if (slot.postiDisponibili < numeroPasseggeri) {
      throw new Error("Posti insufficienti per questo orario");
    }

    const prezzoTotale = calcolaPrezzo({
      numeroPasseggeri,
      andataERitorno,
      prezzoSingola: settings.prezzoSingola,
      prezzoAR: settings.prezzoAR,
    });

    const newBooking: Omit<Booking, "id"> = {
      bookingCode: generateBookingCode(),
      userId,
      routeId,
      timeSlotId,
      vehicleId: slot.vehicleId,
      numeroPasseggeri,
      prezzoTotale,
      stato: "pending",
      paymentId: null,
      createdAt: Date.now(),
    };

    tx.update(slotRef, { postiDisponibili: slot.postiDisponibili - numeroPasseggeri });
    tx.set(bookingRef, newBooking);

    return { id: bookingRef.id, ...newBooking };
  });

  return booking;
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, "bookings", bookingId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null;
}

/**
 * Sottoscrizione realtime usata dalla schermata di pagamento per attendere
 * la conferma asincrona che arriva dal webhook Stripe lato server.
 */
export function subscribeToBooking(bookingId: string, onUpdate: (booking: Booking) => void): () => void {
  return onSnapshot(doc(db, "bookings", bookingId), (snap) => {
    if (snap.exists()) onUpdate({ id: snap.id, ...snap.data() } as Booking);
  });
}

export async function markBookingStatus(bookingId: string, stato: BookingStatus, paymentId?: string) {
  await updateDoc(doc(db, "bookings", bookingId), {
    stato,
    ...(paymentId ? { paymentId } : {}),
  });
}

/**
 * Da chiamare quando un pagamento fallisce o viene annullato: ripristina
 * i posti disponibili sullo slot originale.
 */
export async function cancelBookingAndReleaseSeats(bookingId: string) {
  const bookingRef = doc(db, "bookings", bookingId);

  await runTransaction(db, async (tx) => {
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists()) return;
    const booking = bookingSnap.data() as Booking;
    if (booking.stato === "cancelled") return;

    const slotRef = doc(db, "timeSlots", booking.timeSlotId);
    const slotSnap = await tx.get(slotRef);
    if (slotSnap.exists()) {
      const slot = slotSnap.data() as TimeSlot;
      tx.update(slotRef, {
        postiDisponibili: slot.postiDisponibili + booking.numeroPasseggeri,
      });
    }
    tx.update(bookingRef, { stato: "cancelled" });
  });
}

export async function listBookingsForUser(userId: string): Promise<Booking[]> {
  const q = query(bookingsCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function listBookingsForVehicleAndSlot(vehicleId: string, timeSlotId: string): Promise<Booking[]> {
  const q = query(
    bookingsCol,
    where("vehicleId", "==", vehicleId),
    where("timeSlotId", "==", timeSlotId),
    where("stato", "in", ["paid", "completed"])
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function listBookingsForSlot(timeSlotId: string): Promise<Booking[]> {
  const q = query(
    bookingsCol,
    where("timeSlotId", "==", timeSlotId),
    where("stato", "in", ["paid", "completed"])
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function listAllBookings(filters?: {
  data?: string;
  stato?: BookingStatus;
}): Promise<Booking[]> {
  const clauses = [] as any[];
  if (filters?.stato) clauses.push(where("stato", "==", filters.stato));
  const q = clauses.length ? query(bookingsCol, ...clauses) : query(bookingsCol);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

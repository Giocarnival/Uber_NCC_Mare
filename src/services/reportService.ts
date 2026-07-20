import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Booking } from "../types";

export interface DailyReport {
  data: string;
  incasso: number;
  passeggeri: number;
  corse: number;
  tassoRiempimentoMedio: number;
}

/**
 * Report economico/operativo calcolato lato client sulle prenotazioni pagate
 * o completate. Per volumi elevati questa logica andrebbe spostata in una
 * Cloud Function schedulata che pre-aggrega i dati.
 */
export async function computeDailyReport(dateISO: string, postiVendibiliPerCorsa = 8): Promise<DailyReport> {
  const bookingsCol = collection(db, "bookings");
  const q = query(bookingsCol, where("stato", "in", ["paid", "completed"]));
  const snap = await getDocs(q);

  const bookings = snap.docs
    .map((d) => d.data() as Booking)
    .filter((b) => new Date(b.createdAt).toISOString().slice(0, 10) === dateISO);

  const incasso = bookings.reduce((sum, b) => sum + b.prezzoTotale, 0);
  const passeggeri = bookings.reduce((sum, b) => sum + b.numeroPasseggeri, 0);
  const corseUniche = new Set(bookings.map((b) => b.timeSlotId)).size;
  const tassoRiempimentoMedio = corseUniche > 0 ? passeggeri / (corseUniche * postiVendibiliPerCorsa) : 0;

  return { data: dateISO, incasso, passeggeri, corse: corseUniche, tassoRiempimentoMedio };
}

import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";
import { db } from "./admin";

const ANDATA = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const RITORNO = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

/**
 * Verifica il ruolo admin leggendo prima il custom claim (veloce, nessuna
 * lettura Firestore) e ricadendo su una lettura del profilo solo se il
 * claim non è ancora stato propagato al token (es. subito dopo il seed).
 */
async function assertAdmin(request: CallableRequest) {
  if (request.auth?.token.role === "admin") return;

  const uid = request.auth?.uid;
  const snap = uid ? await db.collection("users").doc(uid).get() : null;
  if (!snap?.exists || snap.data()?.ruolo !== "admin") {
    throw new HttpsError("permission-denied", "Solo un amministratore può generare gli slot.");
  }
}

function* dateRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    yield d.toISOString().slice(0, 10);
  }
}

/**
 * Genera in batch gli slot orari per l'intera stagione (capitolato §22:
 * "Crea una funzione admin per generare automaticamente gli slot orari
 * stagionali", 1 giugno – 15 settembre, alternando i due veicoli).
 */
export const generateSeasonalSlots = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Devi essere autenticato.");
  await assertAdmin(request);

  const {
    startDate,
    endDate,
    routeAndataId,
    routeRitornoId,
    vehicleIds,
    postiVendibili,
  } = request.data as {
    startDate: string;
    endDate: string;
    routeAndataId: string;
    routeRitornoId: string;
    vehicleIds: [string, string];
    postiVendibili: number;
  };

  if (!startDate || !endDate || !routeAndataId || !routeRitornoId || !vehicleIds || vehicleIds.length !== 2) {
    throw new HttpsError("invalid-argument", "Parametri mancanti o non validi.");
  }

  let batch = db.batch();
  let opsInBatch = 0;
  let created = 0;

  async function flushIfNeeded() {
    if (opsInBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      opsInBatch = 0;
    }
  }

  for (const data of dateRange(startDate, endDate)) {
    for (const [i, oraPartenza] of ANDATA.entries()) {
      const ref = db.collection("timeSlots").doc();
      batch.set(ref, {
        routeId: routeAndataId,
        oraPartenza,
        data,
        vehicleId: vehicleIds[i % 2],
        postiDisponibili: postiVendibili,
        active: true,
      });
      created++;
      opsInBatch++;
      await flushIfNeeded();
    }
    for (const [i, oraPartenza] of RITORNO.entries()) {
      const ref = db.collection("timeSlots").doc();
      batch.set(ref, {
        routeId: routeRitornoId,
        oraPartenza,
        data,
        vehicleId: vehicleIds[i % 2],
        postiDisponibili: postiVendibili,
        active: true,
      });
      created++;
      opsInBatch++;
      await flushIfNeeded();
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
  }

  return { created };
});

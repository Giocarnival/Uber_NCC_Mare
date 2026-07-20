import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { TimeSlot } from "../types";
import { TIME_SLOTS, VEHICLES } from "../constants/config";

const timeSlotsCol = collection(db, "timeSlots");

export async function listTimeSlotsForRouteAndDate(
  routeId: string,
  data: string
): Promise<TimeSlot[]> {
  const q = query(
    timeSlotsCol,
    where("routeId", "==", routeId),
    where("data", "==", data),
    where("active", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as TimeSlot)
    .sort((a, b) => a.oraPartenza.localeCompare(b.oraPartenza));
}

export async function updateTimeSlot(id: string, changes: Partial<TimeSlot>) {
  await updateDoc(doc(db, "timeSlots", id), changes);
}

export async function listTimeSlotsForDate(data: string): Promise<TimeSlot[]> {
  const q = query(timeSlotsCol, where("data", "==", data));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as TimeSlot)
    .sort((a, b) => a.oraPartenza.localeCompare(b.oraPartenza));
}

export async function listTimeSlotsForVehicleAndDate(vehicleId: string, data: string): Promise<TimeSlot[]> {
  const q = query(timeSlotsCol, where("vehicleId", "==", vehicleId), where("data", "==", data));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as TimeSlot)
    .sort((a, b) => a.oraPartenza.localeCompare(b.oraPartenza));
}

/**
 * Genera gli slot orari per una singola data, alternando i veicoli
 * disponibili tra andata e ritorno (capitolato §22).
 */
export async function generateDailySlots(params: {
  data: string;
  routeAndataId: string;
  routeRitornoId: string;
  vehicleIds: [string, string];
  postiVendibili: number;
}) {
  const { data, routeAndataId, routeRitornoId, vehicleIds, postiVendibili } = params;

  let created = 0;
  for (const [i, ora] of TIME_SLOTS.andata.entries()) {
    const vehicleId = vehicleIds[i % vehicleIds.length];
    await addDoc(timeSlotsCol, {
      routeId: routeAndataId,
      oraPartenza: ora,
      data,
      vehicleId,
      postiDisponibili: postiVendibili,
      active: true,
    } satisfies Omit<TimeSlot, "id">);
    created++;
  }
  for (const [i, ora] of TIME_SLOTS.ritorno.entries()) {
    const vehicleId = vehicleIds[i % vehicleIds.length];
    await addDoc(timeSlotsCol, {
      routeId: routeRitornoId,
      oraPartenza: ora,
      data,
      vehicleId,
      postiDisponibili: postiVendibili,
      active: true,
    } satisfies Omit<TimeSlot, "id">);
    created++;
  }
  return created;
}

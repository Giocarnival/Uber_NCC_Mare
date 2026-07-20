import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Driver, DriverStatus } from "../types";

const driversCol = collection(db, "drivers");

/**
 * Convenzione di questo scaffold: il documento `drivers/{id}` viene creato
 * dall'admin usando lo stesso uid dell'account Firebase Auth dell'autista,
 * così da poter risalire al veicolo assegnato senza un campo extra.
 */
export async function getDriverByUserId(uid: string): Promise<Driver | null> {
  const snap = await getDoc(doc(db, "drivers", uid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Driver) : null;
}

export async function listDrivers(): Promise<Driver[]> {
  const snap = await getDocs(driversCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Driver);
}

export async function getDriverByVehicle(vehicleId: string): Promise<Driver | null> {
  const q = query(driversCol, where("vehicleId", "==", vehicleId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Driver;
}

export async function createDriver(driver: Omit<Driver, "id">): Promise<string> {
  const ref = await addDoc(driversCol, driver);
  return ref.id;
}

export async function updateDriver(id: string, changes: Partial<Driver>) {
  await updateDoc(doc(db, "drivers", id), changes);
}

export async function setDriverStatus(id: string, stato: DriverStatus) {
  await updateDoc(doc(db, "drivers", id), { stato });
}

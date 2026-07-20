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
import type { Vehicle, VehicleStatus } from "../types";

const vehiclesCol = collection(db, "vehicles");

export async function listVehicles(): Promise<Vehicle[]> {
  const snap = await getDocs(vehiclesCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Vehicle);
}

export async function listActiveVehicles(): Promise<Vehicle[]> {
  const q = query(vehiclesCol, where("stato", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Vehicle);
}

export async function createVehicle(vehicle: Omit<Vehicle, "id">): Promise<string> {
  const ref = await addDoc(vehiclesCol, vehicle);
  return ref.id;
}

export async function updateVehicle(id: string, changes: Partial<Vehicle>) {
  await updateDoc(doc(db, "vehicles", id), changes);
}

export async function setVehicleStatus(id: string, stato: VehicleStatus) {
  await updateDoc(doc(db, "vehicles", id), { stato });
}

export async function assignDriverToVehicle(vehicleId: string, driverId: string | null) {
  await updateDoc(doc(db, "vehicles", vehicleId), { driverId });
}

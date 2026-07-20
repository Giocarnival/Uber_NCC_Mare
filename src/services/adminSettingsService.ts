import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { AdminSettings } from "../types";
import { DEFAULT_PRICING, CANCELLATION_POLICY } from "../constants/config";

const SETTINGS_DOC_ID = "default";

export async function getAdminSettings(): Promise<AdminSettings> {
  const snap = await getDoc(doc(db, "adminSettings", SETTINGS_DOC_ID));
  if (snap.exists()) return snap.data() as AdminSettings;
  return {
    prezzoSingola: DEFAULT_PRICING.prezzoSingola,
    prezzoAR: DEFAULT_PRICING.prezzoAR,
    cancellationPolicy: CANCELLATION_POLICY,
    maxPassengersPerBooking: DEFAULT_PRICING.maxPassengersPerBooking,
  };
}

export async function updateAdminSettings(changes: Partial<AdminSettings>) {
  await setDoc(doc(db, "adminSettings", SETTINGS_DOC_ID), changes, { merge: true });
}

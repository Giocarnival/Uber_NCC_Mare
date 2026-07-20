import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { db } from "./firebase";
import type { VehicleLocation } from "../types";

/**
 * Chiamata dall'app autista ogni 10-15s mentre è online (capitolato §18/§19).
 */
export async function reportVehicleLocation(vehicleId: string, lat: number, lng: number) {
  const location: VehicleLocation = { vehicleId, lat, lng, updatedAt: Date.now() };
  await setDoc(doc(db, "vehicleLocations", vehicleId), location);
}

/**
 * Sottoscrizione realtime usata dalla mappa cliente/admin.
 */
export function subscribeToVehicleLocations(
  onUpdate: (locations: VehicleLocation[]) => void
): () => void {
  const unsub = onSnapshot(collection(db, "vehicleLocations"), (snap) => {
    onUpdate(snap.docs.map((d) => d.data() as VehicleLocation));
  });
  return unsub;
}

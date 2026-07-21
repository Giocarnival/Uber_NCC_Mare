import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { db } from "./firebase";
import type { VehicleLocation } from "../types";

/**
 * Chiamata dall'app autista ogni 10-15s mentre è online (capitolato §18/§19).
 */
export async function reportVehicleLocation(
  vehicleId: string,
  lat: number,
  lng: number,
  heading?: number | null
) {
  const location: VehicleLocation = { vehicleId, lat, lng, heading: heading ?? null, updatedAt: Date.now() };
  await setDoc(doc(db, "vehicleLocations", vehicleId), location);
}

/**
 * Sottoscrizione realtime usata dalla mappa cliente/admin.
 */
export function subscribeToVehicleLocations(
  onUpdate: (locations: VehicleLocation[]) => void
): () => void {
  const unsub = onSnapshot(
    collection(db, "vehicleLocations"),
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as VehicleLocation));
    },
    () => {
      // Es. permission-denied dopo un logout mentre il listener era ancora
      // attivo: nessun dato da mostrare, non deve propagare un'eccezione
      // non gestita che interromperebbe la navigazione in corso.
      onUpdate([]);
    }
  );
  return unsub;
}

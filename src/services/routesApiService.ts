import type { GeoPoint } from "../types";

const ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

/**
 * Calcola l'ETA in minuti tra due punti tramite Google Routes API
 * (capitolato §4: "Routes API per calcolare percorso, distanza e tempi").
 * Richiede EXPO_PUBLIC_GOOGLE_MAPS_API_KEY con la Routes API abilitata sul
 * progetto Google Cloud. Ritorna null se la chiave manca o la richiesta fallisce.
 */
export async function getETAMinutes(origin: GeoPoint, destination: GeoPoint): Promise<number | null> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration",
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: "DRIVE",
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const durationSeconds = parseInt(data?.routes?.[0]?.duration?.replace("s", "") ?? "", 10);
    if (Number.isNaN(durationSeconds)) return null;
    return Math.round(durationSeconds / 60);
  } catch {
    return null;
  }
}

/**
 * ETA verso la fermata più vicina tra le due (capitolato §19: "Mostra ETA
 * indicativo verso la fermata usando Google Routes API").
 */
export async function getETAToNearestStop(
  origin: GeoPoint,
  stops: GeoPoint[]
): Promise<number | null> {
  const results = await Promise.all(stops.map((stop) => getETAMinutes(origin, stop)));
  const valid = results.filter((r): r is number => r !== null);
  return valid.length > 0 ? Math.min(...valid) : null;
}

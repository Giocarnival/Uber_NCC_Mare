// Configurazione di dominio per Sabaudia Shuttle (capitolato §3, §7, §8).
// Questi sono i valori di default usati per il seed e come fallback se
// adminSettings non è ancora stato configurato in Firestore.

export const ROUTES = {
  CENTRO_TO_LUNGOMARE: {
    nome: "Sabaudia Centro → Lungomare",
    origine: "Sabaudia Centro",
    destinazione: "Lungomare di Sabaudia",
    distanzaKm: 5,
    durataStimataMinuti: 12,
  },
  LUNGOMARE_TO_CENTRO: {
    nome: "Lungomare → Sabaudia Centro",
    origine: "Lungomare di Sabaudia",
    destinazione: "Sabaudia Centro",
    distanzaKm: 5,
    durataStimataMinuti: 12,
  },
};

export const DEFAULT_PRICING = {
  prezzoSingola: 4,
  prezzoAR: 7,
  pacchetto10Corse: 35,
  maxPassengersPerBooking: 8,
};

export const VEHICLES = [
  { nome: "Vito 1", postiTotali: 9, postiVendibili: 8 },
  { nome: "Vito 2", postiTotali: 9, postiVendibili: 8 },
];

export const OPERATING_SEASON = {
  start: "06-01", // 1 giugno
  end: "09-15", // 15 settembre
};

export const TIME_SLOTS = {
  andata: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  ritorno: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
};

export const CANCELLATION_POLICY =
  "Cancellazione gratuita fino a 2 ore prima della partenza. Oltre tale termine nessun rimborso.";

// Coordinate indicative delle due fermate, usate come fallback per la mappa
// e per il calcolo ETA via Google Routes API. Da affinare con le coordinate
// esatte del punto di ritrovo scelto (parcheggio, piazza, stabilimento...).
export const STOPS = {
  sabaudiaCentro: { lat: 41.302, lng: 13.0269 },
  lungomare: { lat: 41.2895, lng: 13.0503 },
};

/**
 * Script di seed per l'ambiente di sviluppo/staging (capitolato §14).
 * Non viene deployato come Cloud Function: si esegue localmente con
 *   npm run seed
 * usando le credenziali del progetto Firebase indicate da
 * GOOGLE_APPLICATION_CREDENTIALS (service account) oppure, se punti
 * all'emulatore, con FIRESTORE_EMULATOR_HOST=localhost:8080.
 */
import { db } from "./admin";

const VEHICLES = [
  { nome: "Vito 1", targa: "DA000AA", postiTotali: 9, postiVendibili: 8, stato: "active", posizioneCorrente: null, driverId: null },
  { nome: "Vito 2", targa: "DA000AB", postiTotali: 9, postiVendibili: 8, stato: "active", posizioneCorrente: null, driverId: null },
];

const ROUTES = [
  {
    nome: "Sabaudia Centro → Lungomare",
    origine: "Sabaudia Centro",
    destinazione: "Lungomare di Sabaudia",
    distanzaKm: 5,
    durataStimataMinuti: 12,
    active: true,
  },
  {
    nome: "Lungomare → Sabaudia Centro",
    origine: "Lungomare di Sabaudia",
    destinazione: "Sabaudia Centro",
    distanzaKm: 5,
    durataStimataMinuti: 12,
    active: true,
  },
];

const ADMIN_SETTINGS = {
  prezzoSingola: 4,
  prezzoAR: 7,
  cancellationPolicy: "Cancellazione gratuita fino a 2 ore prima della partenza. Oltre tale termine nessun rimborso.",
  maxPassengersPerBooking: 8,
};

async function seed() {
  console.log("Seeding vehicles...");
  const vehicleIds: string[] = [];
  for (const v of VEHICLES) {
    const ref = await db.collection("vehicles").add(v);
    vehicleIds.push(ref.id);
    console.log(`  + ${v.nome} (${ref.id})`);
  }

  console.log("Seeding routes...");
  const routeIds: string[] = [];
  for (const r of ROUTES) {
    const ref = await db.collection("routes").add(r);
    routeIds.push(ref.id);
    console.log(`  + ${r.nome} (${ref.id})`);
  }

  console.log("Seeding adminSettings...");
  await db.collection("adminSettings").doc("default").set(ADMIN_SETTINGS);

  console.log("\nFatto. ID di riferimento per generare gli slot orari:");
  console.log({ vehicleIds, routeAndataId: routeIds[0], routeRitornoId: routeIds[1] });
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

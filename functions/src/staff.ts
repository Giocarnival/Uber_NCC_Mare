import { onCall, HttpsError } from "firebase-functions/v2/https";
import { auth, db } from "./admin";

interface CreateStaffAccountInput {
  email: string;
  password: string;
  nome: string;
  cognome: string;
  telefono: string;
  ruolo: "driver" | "admin";
}

/**
 * Crea un account staff (autista o admin): utente Firebase Auth + profilo
 * users/{uid} + (per i driver) il documento drivers/{uid}, usando lo stesso
 * uid per entrambi come previsto dalla convenzione in src/services/driverService.ts.
 * Solo un admin già autenticato può chiamarla.
 */
export const createStaffAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Devi essere autenticato.");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Solo un amministratore può creare account staff.");
  }

  const { email, password, nome, cognome, telefono, ruolo } = request.data as CreateStaffAccountInput;

  if (!email || !password || !nome || !cognome || !ruolo) {
    throw new HttpsError("invalid-argument", "Dati mancanti.");
  }
  if (ruolo !== "driver" && ruolo !== "admin") {
    throw new HttpsError("invalid-argument", "Ruolo non valido.");
  }

  const userRecord = await auth.createUser({
    email,
    password,
    displayName: `${nome} ${cognome}`,
  });

  await db.collection("users").doc(userRecord.uid).set({
    id: userRecord.uid,
    nome,
    cognome,
    email,
    telefono: telefono ?? "",
    ruolo,
    createdAt: Date.now(),
  });

  if (ruolo === "driver") {
    await db.collection("drivers").doc(userRecord.uid).set({
      nome,
      cognome,
      telefono: telefono ?? "",
      email,
      vehicleId: null,
      stato: "offline",
    });
  }

  return { uid: userRecord.uid };
});

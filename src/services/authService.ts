import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "./firebase";
import type { UserProfile, UserRole } from "../types";

export async function registerCustomer(params: {
  email: string;
  password: string;
  nome: string;
  cognome: string;
  telefono: string;
}): Promise<UserProfile> {
  const { email, password, nome, cognome, telefono } = params;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile: UserProfile = {
    id: credential.user.uid,
    nome,
    cognome,
    email,
    telefono,
    ruolo: "customer",
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "users", profile.id), profile);
  return profile;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function requestPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function getCurrentUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, changes: Partial<UserProfile>) {
  await setDoc(doc(db, "users", uid), changes, { merge: true });
}

/**
 * Crea un account staff (autista o admin) tramite la Cloud Function
 * `createStaffAccount` (solo un admin autenticato può chiamarla). A
 * differenza di registerCustomer, qui l'account non viene creato lato
 * client: serve per non far perdere all'admin la propria sessione (creare
 * un utente con l'SDK client autentica automaticamente il nuovo account al
 * posto di quello corrente).
 */
export async function createStaffAccount(params: {
  email: string;
  password: string;
  nome: string;
  cognome: string;
  telefono: string;
  ruolo: "driver" | "admin";
}): Promise<{ uid: string }> {
  const callable = httpsCallable<typeof params, { uid: string }>(functions, "createStaffAccount");
  const result = await callable(params);
  return result.data;
}

export function dashboardRouteForRole(role: UserRole): string {
  switch (role) {
    case "customer":
      return "/(customer)";
    case "driver":
      return "/(driver)";
    case "admin":
      return "/(admin)";
  }
}

import { collection, doc, getDocs, addDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Route } from "../types";

const routesCol = collection(db, "routes");

export async function listActiveRoutes(): Promise<Route[]> {
  const q = query(routesCol, where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Route);
}

export async function createRoute(route: Omit<Route, "id">): Promise<string> {
  const ref = await addDoc(routesCol, route);
  return ref.id;
}

export async function updateRoute(id: string, changes: Partial<Route>) {
  await updateDoc(doc(db, "routes", id), changes);
}

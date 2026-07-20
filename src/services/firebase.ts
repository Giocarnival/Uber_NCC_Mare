import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, type Auth } from "firebase/auth";
// @ts-ignore -- getReactNativePersistence non è ancora tipizzato nell'export pubblico di firebase/auth
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { Platform } from "react-native";

// Le credenziali vengono lette da variabili d'ambiente Expo (EXPO_PUBLIC_*),
// da valorizzare in un file .env locale a partire da .env.example.
// Nessuna chiave è hardcoded nel codice sorgente.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);
export const functions = getFunctions(app);

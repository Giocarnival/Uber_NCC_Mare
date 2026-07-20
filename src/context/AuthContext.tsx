import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../services/firebase";
import { getCurrentUserProfile } from "../services/authService";
import { registerForPushNotifications } from "../services/notificationService";
import type { UserProfile } from "../types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getCurrentUserProfile(firebaseUser.uid).catch(() => null);
        setProfile(p);
        registerForPushNotifications(firebaseUser.uid).catch(() => {});
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Da usare nei layout delle aree protette (customer/driver/admin): riporta
 * alla home non appena non c'è più un utente autenticato, indipendentemente
 * da quando esattamente lo stato di auth si aggiorna rispetto alla
 * navigazione esplicita del pulsante di logout (evita che il logout sembri
 * "non funzionare" per una race condition tra signOut e il redirect).
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user]);
}

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import * as Location from "expo-location";
import { useAuth } from "./AuthContext";
import { getDriverByUserId, setDriverStatus } from "../services/driverService";
import { reportVehicleLocation } from "../services/locationService";

const REPORT_INTERVAL_MS = 12_000; // 10-15s come da capitolato §18/§19

interface DriverDutyContextValue {
  onDuty: boolean;
  starting: boolean;
  vehicleId: string | null;
  lastLocation: { lat: number; lng: number } | null;
  permissionDenied: boolean;
  startDuty: () => Promise<void>;
  endDuty: () => Promise<void>;
}

const DriverDutyContext = createContext<DriverDutyContextValue>({
  onDuty: false,
  starting: false,
  vehicleId: null,
  lastLocation: null,
  permissionDenied: false,
  startDuty: async () => {},
  endDuty: async () => {},
});

/**
 * Gestisce l'inizio/fine servizio dell'autista a livello di gruppo "(driver)"
 * (non della singola schermata): così lo stato "in servizio" e l'invio
 * periodico della posizione sopravvivono alla navigazione tra le schermate
 * autista (Dashboard, Corse di oggi, ecc.) e si fermano solo quando
 * l'autista preme esplicitamente "Termina servizio" (o fa logout).
 */
export function DriverDutyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onDuty, setOnDuty] = useState(false);
  const [starting, setStarting] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startDuty() {
    if (!user || onDuty) return;
    setStarting(true);
    setPermissionDenied(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        return;
      }

      const driver = await getDriverByUserId(user.uid);
      if (!driver?.vehicleId) return;

      setVehicleId(driver.vehicleId);
      await setDriverStatus(user.uid, "available");
      setOnDuty(true);

      const tick = async () => {
        const loc = await Location.getCurrentPositionAsync({});
        setLastLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        await reportVehicleLocation(driver.vehicleId!, loc.coords.latitude, loc.coords.longitude);
      };
      await tick();
      intervalRef.current = setInterval(tick, REPORT_INTERVAL_MS);
    } finally {
      setStarting(false);
    }
  }

  async function endDuty() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setOnDuty(false);
    if (user) await setDriverStatus(user.uid, "offline");
  }

  return (
    <DriverDutyContext.Provider
      value={{ onDuty, starting, vehicleId, lastLocation, permissionDenied, startDuty, endDuty }}
    >
      {children}
    </DriverDutyContext.Provider>
  );
}

export function useDriverDuty() {
  return useContext(DriverDutyContext);
}

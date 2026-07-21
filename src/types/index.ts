// Tipi TypeScript per lo schema Firestore di Sabaudia Shuttle
// Vedi docs/CAPITOLATO_FUNZIONALE.md sezione 10.

export type UserRole = "customer" | "driver" | "admin";

export interface UserProfile {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  ruolo: UserRole;
  createdAt: number;
}

export type VehicleStatus = "active" | "inactive" | "maintenance";

export interface Vehicle {
  id: string;
  nome: string; // es. "Vito 1"
  targa: string;
  postiTotali: number; // 9
  postiVendibili: number; // 8
  stato: VehicleStatus;
  posizioneCorrente: GeoPoint | null;
  driverId: string | null;
}

export type DriverStatus = "available" | "busy" | "offline";

export interface Driver {
  id: string;
  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  vehicleId: string | null;
  stato: DriverStatus;
}

export interface Route {
  id: string;
  nome: string;
  origine: string;
  destinazione: string;
  distanzaKm: number;
  durataStimataMinuti: number;
  active: boolean;
}

export interface TimeSlot {
  id: string;
  routeId: string;
  oraPartenza: string; // "HH:mm"
  data: string; // "YYYY-MM-DD"
  vehicleId: string;
  postiDisponibili: number;
  active: boolean;
}

export type BookingStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  routeId: string;
  timeSlotId: string;
  vehicleId: string;
  numeroPasseggeri: number;
  prezzoTotale: number;
  stato: BookingStatus;
  paymentId: string | null;
  createdAt: number;
}

export type PaymentStatus = "requires_payment" | "succeeded" | "failed" | "refunded";

export interface Payment {
  id: string;
  bookingId: string;
  provider: "stripe";
  amount: number;
  status: PaymentStatus;
  createdAt: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface VehicleLocation {
  vehicleId: string;
  lat: number;
  lng: number;
  heading?: number | null; // gradi 0-360, direzione di marcia (bussola)
  updatedAt: number;
}

export interface AdminSettings {
  prezzoSingola: number;
  prezzoAR: number;
  cancellationPolicy: string;
  maxPassengersPerBooking: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: number | null;
}

export type NotificationType =
  | "booking_confirmed"
  | "trip_reminder"
  | "trip_cancelled"
  | "new_trip_assigned"
  | "trip_changed";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: number;
}

# Sabaudia Shuttle

Piattaforma web + mobile per la prenotazione di trasporto NCC condiviso tra
**Sabaudia Centro** e il **Lungomare di Sabaudia**, con 2 Mercedes Vito da 9 posti.

Il progetto nasce dal capitolato funzionale in [docs/CAPITOLATO_FUNZIONALE.md](docs/CAPITOLATO_FUNZIONALE.md)
(derivato da `docs/UberNCCSaba.docx`), che descrive contesto legale NCC, business plan e specifica tecnica completa.

## Stack

- **App** (cliente, autista, admin, web): [Expo](https://expo.dev) + React Native + TypeScript + Expo Router (file-based, in `src/app`)
- **Backend**: Firebase Authentication, Firestore, Cloud Functions (in `functions/`)
- **Pagamenti**: Stripe — PaymentSheet nativo reale su iOS/Android (`src/app/(customer)/payment.tsx`), flusso simulato su web in attesa dell'integrazione Stripe Elements (`payment.web.tsx`)
- **Mappe**: `react-native-maps` (nativo) + Google Routes API per l'ETA dei veicoli
- **Notifiche**: Expo Notifications (conferma prenotazione, promemoria partenza)

## Struttura

```
src/
  app/            Schermate (Expo Router): (auth), (customer), (driver), (admin)
  components/     Componenti condivisi (PrimaryButton, RouteCard, TimeSlotCard, StripeRoot, ...)
  services/       Accesso a Firebase (auth, booking, vehicle, route, timeSlot, payment, location, driver, report, notifiche, Routes API)
  context/        AuthContext (stato utente/ruolo globale, registrazione push token)
  types/          Tipi TypeScript per lo schema Firestore
  constants/      Tema (colori estivi), configurazione di dominio (tratte, prezzi, orari, coordinate fermate)
  utils/          Calcolo prezzi, codice prenotazione, date
functions/        Cloud Functions: createPaymentIntent, stripeWebhook, generateSeasonalSlots,
                  onUserRoleChange (custom claims), createStaffAccount, onBookingPaid,
                  sendTripReminders, seed
docs/             Capitolato funzionale e documento originale
firestore.rules   Regole di sicurezza Firestore per ruolo (customer/driver/admin)
```

## Setup locale

Prerequisiti: Node.js LTS, un progetto Firebase (Auth + Firestore abilitati), un account Stripe (modalità test), una API key Google Maps Platform con Maps SDK + Routes API abilitate.

```powershell
npm install
copy .env.example .env   # poi valorizza le variabili EXPO_PUBLIC_*
npm run start
```

Senza le variabili Firebase in `.env`, l'app si avvia comunque ma le chiamate a
Firestore/Auth falliranno: utile per lavorare sulla UI, non per il flusso end-to-end.

### Firestore

```powershell
npm install -g firebase-tools
firebase login
firebase use --add          # collega il progetto Firebase
firebase deploy --only firestore:rules,firestore:indexes
```

### Cloud Functions

```powershell
cd functions
npm install
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
npm run deploy
```

Configura poi l'endpoint webhook su Stripe Dashboard puntando all'URL della function `stripeWebhook`.
`onUserRoleChange` tiene sincronizzato il custom claim `role` con il campo `ruolo` di `users/{uid}`:
dopo un cambio di ruolo il client deve forzare il refresh del token (`user.getIdToken(true)`) o rifare login.

### Seed dati di sviluppo (incluso il primo account admin)

```powershell
cd functions
$env:GOOGLE_APPLICATION_CREDENTIALS = "percorso\service-account.json"
$env:SEED_ADMIN_EMAIL = "admin@sabaudiashuttle.it"     # opzionale
$env:SEED_ADMIN_PASSWORD = "unaPasswordSicura123"       # opzionale, altrimenti generata e stampata
npm run seed
```

Crea 2 veicoli (Vito 1/2), le due tratte Sabaudia Centro ⇄ Lungomare, le tariffe di default (4 € / 7 €)
e il **primo account amministratore** (stampato a console) — necessario per accedere al pannello
admin e da lì creare gli account autista (`Autisti` → "Crea account autista", usa la Cloud Function
`createStaffAccount`). Dopo il seed, genera gli slot orari della stagione dal pannello admin
(`Orari` → data per data) oppure chiamando `generateSeasonalSlots` con gli ID stampati dallo script.

### Notifiche push

Le notifiche funzionano solo su dispositivo fisico (non su simulatore/emulatore, non sul web).
`registerForPushNotifications` (chiamato automaticamente al login, vedi `AuthContext`) richiede un
`projectId` EAS valido in `app.json`/`eas.json`: esegui `eas init` la prima volta per generarlo.

## Come testare l'app

**Web** (solo per navigazione/UI/admin — il pagamento è simulato):
```powershell
npm run web
```

**Mobile** (Expo Go — richiede lo stesso Wi-Fi tra PC e telefono):
```powershell
npm run start
```
Scansiona il QR code con l'app Expo Go (iOS/Android). Il pagamento reale con Stripe PaymentSheet
funziona solo così, non in Expo Go per moduli nativi complessi come Stripe — se necessario, crea un
**development build** con `eas build --profile development` (richiede account Expo/EAS).

## Cosa è già implementato

- Navigazione a 3 ruoli (cliente/autista/admin), autenticazione email/password
- Prenotazione con blocco overbooking (transazione Firestore), calcolo prezzo da tariffe admin
- Gestione veicoli/autisti/tratte/orari/prezzi/prenotazioni, report con export CSV
- Tracking posizione autista via `expo-location`, ETA veicoli via Google Routes API
- Pagamento reale Stripe PaymentSheet (nativo) con conferma via webhook server-side
- QR code reale del biglietto (`react-native-qrcode-svg`)
- Notifiche push: conferma prenotazione (trigger su pagamento riuscito) e promemoria partenza (funzione schedulata ogni 15 minuti)
- Custom claims Firebase sincronizzati automaticamente dal ruolo utente; Cloud Functions admin-only protette tramite claim
- Creazione account staff (driver) da pannello admin, con account Firebase Auth reale
- Security rules Firestore, script di seed con primo account admin

## Cosa manca ancora prima del go-live

- Integrazione Stripe **web** (Stripe Elements/`@stripe/stripe-js`) — oggi `payment.web.tsx` simula l'esito
- Notifiche "nuova corsa"/"variazione corsa" lato autista (stesso pattern di `onBookingPaid`, non ancora implementato)
- Creazione account **admin** da UI (oggi solo via seed script o Firebase Console — per sicurezza, farlo richiede una decisione su chi può promuovere un altro utente ad admin)
- Coordinate reali delle fermate in `src/constants/config.ts` (`STOPS`) — sono indicative, da verificare sul campo
- Test automatici (capitolato §25)

Vedi il capitolato per la roadmap completa (Fase 1/2/3).

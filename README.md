# Sabaudia Shuttle

Piattaforma web + mobile per la prenotazione di trasporto NCC condiviso tra
**Sabaudia Centro** e il **Lungomare di Sabaudia**, con 2 Mercedes Vito da 9 posti.

Il progetto nasce dal capitolato funzionale in [docs/CAPITOLATO_FUNZIONALE.md](docs/CAPITOLATO_FUNZIONALE.md)
(derivato da `docs/UberNCCSaba.docx`), che descrive contesto legale NCC, business plan e specifica tecnica completa.

## Stack

- **App** (cliente, autista, admin, web): [Expo](https://expo.dev) + React Native + TypeScript + Expo Router (file-based, in `src/app`)
- **Backend**: Firebase Authentication, Firestore, Cloud Functions (in `functions/`)
- **Pagamenti**: Stripe (PaymentIntent creato lato server, PaymentSheet lato client — vedi nota sotto)
- **Mappe**: `react-native-maps` (nativo) + Google Maps Platform (Routes API, da integrare)

## Struttura

```
src/
  app/            Schermate (Expo Router): (auth), (customer), (driver), (admin)
  components/     Componenti condivisi (PrimaryButton, RouteCard, TimeSlotCard, ...)
  services/       Accesso a Firebase (auth, booking, vehicle, route, timeSlot, payment, location, driver, report)
  context/        AuthContext (stato utente/ruolo globale)
  types/          Tipi TypeScript per lo schema Firestore
  constants/      Tema (colori estivi), configurazione di dominio (tratte, prezzi, orari)
  utils/          Calcolo prezzi, codice prenotazione, date
functions/        Cloud Functions: createPaymentIntent, stripeWebhook, generateSeasonalSlots, seed
docs/             Capitolato funzionale e documento originale
firestore.rules   Regole di sicurezza Firestore per ruolo (customer/driver/admin)
```

## Setup locale

Prerequisiti: Node.js LTS, un progetto Firebase (Auth + Firestore abilitati), un account Stripe (modalità test), una API key Google Maps Platform.

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

### Seed dati di sviluppo

```powershell
cd functions
npm install
$env:GOOGLE_APPLICATION_CREDENTIALS = "percorso\service-account.json"
npm run seed
```

Crea 2 veicoli (Vito 1/2), le due tratte Sabaudia Centro ⇄ Lungomare e le tariffe di default (4 € / 7 €).
Dopo il seed, genera gli slot orari della stagione dal pannello admin (`Orari` → data per data)
oppure chiamando la Cloud Function `generateSeasonalSlots` con gli ID stampati dallo script.

### Cloud Functions (Stripe)

```powershell
cd functions
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
npm run deploy
```

Configura poi l'endpoint webhook su Stripe Dashboard puntando all'URL della function `stripeWebhook`.

## Cosa è già implementato vs cosa manca

**Implementato**: navigazione a 3 ruoli (cliente/autista/admin), autenticazione email/password,
prenotazione con blocco overbooking (transazione Firestore), calcolo prezzo da tariffe admin,
gestione veicoli/autisti/tratte/orari/prezzi/prenotazioni, report con export CSV, tracking
posizione autista via `expo-location`, security rules Firestore, Cloud Functions pagamento e
generazione slot stagionali.

**Da completare prima del go-live** (intenzionalmente fuori scope per questo scaffold iniziale):
- Integrazione reale `@stripe/stripe-react-native` (PaymentSheet) in `src/app/(customer)/payment.tsx` — oggi il pagamento è simulato dopo la chiamata alla Cloud Function.
- QR code reale in `TicketQRCode` (placeholder grafico) con `react-native-qrcode-svg`.
- Notifiche push (Expo Notifications) per conferme/promemoria.
- Google Routes API per ETA reale sulla mappa.
- Custom claims Firebase (o verifica ruolo) per proteggere in modo più granulare le Cloud Functions admin-only.

Vedi il capitolato per la roadmap completa (Fase 1/2/3).

# Capitolato Funzionale — Sabaudia Shuttle

Piattaforma Web + Mobile per Prenotazione Trasporto NCC
Versione 1.0 — Committente: Giovanni Carnevale

> Documento derivato dalla consulenza raccolta in `UberNCCSaba.docx` (analisi legale NCC, business plan e specifica funzionale/tecnica).

## 1. Scopo del progetto

Piattaforma digitale composta da:

- Applicazione Mobile Cliente (iOS/Android)
- Applicazione Mobile Autista (iOS/Android)
- Portale Web Cliente
- Pannello Web Amministratore

Consente di prenotare posti a bordo di veicoli NCC tra **Sabaudia Centro** e **Lungomare di Sabaudia** (~5 km).

Flotta iniziale: 2 Mercedes Vito da 9 posti (8 vendibili), 2 autisti NCC.
Periodo operativo: 1 giugno – 15 settembre.

## 2. Contesto legale (NCC)

- La Corte Costituzionale ha dichiarato illegittimo l'obbligo di rientro in rimessa dopo ogni singolo servizio: un veicolo NCC può quindi effettuare più corse consecutive nella giornata.
- Ogni corsa deve essere **prenotata** prima dell'inizio del servizio: l'NCC non può stazionare o raccogliere clienti "al volo" come un taxi o un mezzo di linea.
- Il modello scelto (prenotazione obbligatoria, assegnazione dinamica del veicolo, nessuna fermata "a chiamata") è quello più coerente con la normativa NCC rispetto a un servizio a fermate fisse/orari fissi stile trasporto pubblico di linea, che rischierebbe di sconfinare in un'area autorizzativa diversa.

## 3. Stima imprenditoriale (riferimento)

| Voce | Costo stagionale (~3,5 mesi) |
|---|---|
| Autisti (2 × 2.600 €/mese costo azienda) | 18.200 € |
| Carburante (Vito, ~200 km/giorno/veicolo) | 7.500 € |
| Altri costi (manutenzione, commissioni, app, marketing) | 5.000 € |
| **Totale** | **~31.000 €** |

Break-even indicativo: ~74 passeggeri/giorno (~37 per mezzo, ~6 corse/giorno/mezzo con 6 pax medi).

Tariffe di partenza: 4 € singola tratta, 7 € A/R, pacchetto 10 corse = 35 €.

## 4. Obiettivi del sistema

Prenotazione posti, pagamento online, visualizzazione veicoli su mappa, gestione flotte/autisti/orari/tratte, monitoraggio incassi, statistiche operative, riduzione della gestione manuale.

## 5. Architettura generale

**Frontend**
- Cliente: App Android/iOS + Web App responsive
- Autista: App Android/iOS
- Admin: Dashboard Web

**Backend**
- Firebase Authentication
- Firestore Database
- Cloud Functions
- Stripe Payment Gateway
- Google Maps Platform

**Stack tecnico**: React Native + Expo + TypeScript (Expo Router) per un'unica codebase web/iOS/Android.

## 6. Ruoli utente

- **Cliente**: registrazione, login, prenotazione, pagamento, ticket, storico.
- **Autista**: login, corse assegnate, passeggeri, tracking GPS, stati corsa.
- **Amministratore**: gestione utenti/autisti/veicoli/prezzi/prenotazioni, reportistica.

## 7. Tratte e tariffe iniziali

- Tratta 1: Sabaudia Centro → Lungomare
- Tratta 2: Lungomare → Sabaudia Centro
- Distanza: ~5 km

| Tariffa | Prezzo |
|---|---|
| Corsa singola | 4 € |
| Andata e ritorno | 7 € |
| Pacchetto 10 corse | 35 € |

Modificabili da pannello amministratore.

## 8. Fasce orarie iniziali

**Andata (mattina)**: 08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
**Ritorno (sera)**: 17:00, 17:30, 18:00, 18:30, 19:00, 19:30, 20:00, 20:30

## 9. Flusso di prenotazione

1. Cliente apre l'app.
2. Sceglie tratta (Centro → Mare o Mare → Centro).
3. Sceglie data e orario disponibile.
4. Indica numero passeggeri (min 1, max posti disponibili).
5. Sistema verifica disponibilità e calcola il prezzo.
6. Cliente paga (booking → `pending` → `paid`).
7. Posti disponibili si riducono (transazione atomica, anti-overbooking).
8. Cliente riceve codice prenotazione / QR code.
9. Autista vede la prenotazione e conferma la salita.
10. A fine corsa, booking → `completed`.

## 10. Modello dati (Firestore)

Collections: `users`, `vehicles`, `drivers`, `routes`, `timeSlots`, `bookings`, `payments`, `vehicleLocations`, `adminSettings`, `notifications`, `coupons`.

Vedi `src/types/index.ts` per la definizione TypeScript completa di ciascuna entità.

## 11. Roadmap

**Fase 1 — MVP**: registrazione, login, prenotazione, pagamento, dashboard admin, dashboard autista, mappa semplice.
**Fase 2**: QR code, notifiche push, coupon.
**Fase 3**: abbonamenti, loyalty, convenzioni stabilimenti, promozioni automatiche, algoritmo di assegnazione automatica mezzo, multilingua.

## 12. Criteri di accettazione

- L'utente può prenotare un posto.
- Il pagamento è effettuabile online.
- L'autista vede le corse assegnate.
- Il gestore monitora le prenotazioni.
- Il sistema impedisce l'overbooking.
- I veicoli sono visualizzati sulla mappa.
- Sono disponibili report economici e operativi.

## 13. Requisiti non funzionali

- Tempo di risposta < 2 secondi.
- Disponibilità target 99,5%.
- Compatibilità: iOS, Android, Chrome, Edge, Safari, Firefox.
- HTTPS obbligatorio, crittografia dati, backup automatici, conformità GDPR.

## 14. Estensioni future

Possibile estensione del modello a San Felice Circeo, Terracina, Latina Mare, servizi aeroportuali, servizi turistici stagionali.

import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { auth } from "./admin";

/**
 * Tiene sincronizzato il custom claim "role" con il campo `ruolo` del
 * documento users/{uid}, così le Cloud Functions admin-only (createStaffAccount,
 * generateSeasonalSlots) possono verificare il ruolo leggendo l'ID token
 * (request.auth.token.role) invece di fare una lettura Firestore extra ad
 * ogni chiamata (capitolato: "Custom claims Firebase ... per proteggere in
 * modo più granulare le Cloud Functions admin-only").
 *
 * Nota: i custom claims si applicano solo ai NUOVI ID token. Dopo che il
 * ruolo di un utente cambia, il client deve forzare il refresh del token
 * con `await user.getIdToken(true)` (o effettuare un nuovo login) prima
 * che il nuovo claim sia visibile alle Cloud Functions.
 */
export const onUserRoleChange = onDocumentWritten("users/{uid}", async (event) => {
  const { uid } = event.params;
  const after = event.data?.after;

  if (!after?.exists) {
    // Utente eliminato: nessun claim da mantenere.
    return;
  }

  const ruolo = after.data()?.ruolo;
  if (!ruolo) return;

  await auth.setCustomUserClaims(uid, { role: ruolo });
});

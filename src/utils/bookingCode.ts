// Genera un codice prenotazione leggibile e univoco, es. "SBS-7K2P9Q".
export function generateBookingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // esclude caratteri ambigui (0,O,1,I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SBS-${code}`;
}

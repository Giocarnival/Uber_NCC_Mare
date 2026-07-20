export function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function formatDateIT(dateISO: string): string {
  const [y, m, d] = dateISO.split("-");
  return `${d}/${m}/${y}`;
}

export function isWithinSeason(dateISO: string, seasonStartMMDD: string, seasonEndMMDD: string): boolean {
  const mmdd = dateISO.slice(5);
  return mmdd >= seasonStartMMDD && mmdd <= seasonEndMMDD;
}

export function combineDateAndTime(dateISO: string, time: string): Date {
  return new Date(`${dateISO}T${time}:00`);
}

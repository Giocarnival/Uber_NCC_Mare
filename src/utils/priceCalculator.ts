import { DEFAULT_PRICING } from "../constants/config";

export interface PriceInput {
  numeroPasseggeri: number;
  andataERitorno: boolean;
  prezzoSingola?: number;
  prezzoAR?: number;
}

export function calcolaPrezzo({
  numeroPasseggeri,
  andataERitorno,
  prezzoSingola = DEFAULT_PRICING.prezzoSingola,
  prezzoAR = DEFAULT_PRICING.prezzoAR,
}: PriceInput): number {
  if (numeroPasseggeri < 1) {
    throw new Error("Il numero di passeggeri deve essere almeno 1");
  }
  const prezzoUnitario = andataERitorno ? prezzoAR : prezzoSingola;
  return Number((prezzoUnitario * numeroPasseggeri).toFixed(2));
}

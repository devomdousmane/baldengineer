import type { Market } from "@/types/database";

/** Taux de TVA standard en Guinée (certaines entreprises en sont exonérées — modifiable par ligne). */
export const GUINEE_VAT_RATE = 18;

/** Taux de TVA par défaut à appliquer à une nouvelle ligne selon le marché. */
export function defaultVatRate(market: Market, franceRate: number): number {
  return market === "france" ? franceRate : GUINEE_VAT_RATE;
}

export interface TotalsLineItem {
  quantity: number;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
}

export interface DocumentTotals {
  ht: number;
  vat: number;
  ttc: number;
}

/** Calcule les totaux HT/TVA/TTC d'un document à partir de ses lignes, ligne par ligne
 *  (chaque ligne peut avoir un taux de TVA et une remise différents), avec arrondi au centime
 *  à chaque étape pour éviter les écarts d'arrondi cumulés entre l'affichage et le total final. */
export function calcTotals(lines: TotalsLineItem[]): DocumentTotals {
  let ht = 0;
  let vat = 0;
  for (const l of lines) {
    const lineHt = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
    vat += Math.round((lineHt * l.vat_rate) / 100 * 100) / 100;
    ht += lineHt;
  }
  return {
    ht: Math.round(ht * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    ttc: Math.round((ht + vat) * 100) / 100,
  };
}

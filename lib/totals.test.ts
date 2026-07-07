import { describe, it, expect } from "vitest";
import { calcTotals } from "./totals";

describe("calcTotals", () => {
  it("retourne des totaux nuls pour une liste vide", () => {
    expect(calcTotals([])).toEqual({ ht: 0, vat: 0, ttc: 0 });
  });

  it("calcule HT/TVA/TTC pour une seule ligne sans remise", () => {
    const totals = calcTotals([{ quantity: 2, unit_price: 500, vat_rate: 20, discount_pct: 0 }]);
    expect(totals.ht).toBe(1000);
    expect(totals.vat).toBe(200);
    expect(totals.ttc).toBe(1200);
  });

  it("applique la remise avant de calculer la TVA", () => {
    const totals = calcTotals([{ quantity: 1, unit_price: 1000, vat_rate: 20, discount_pct: 10 }]);
    expect(totals.ht).toBe(900);
    expect(totals.vat).toBe(180);
    expect(totals.ttc).toBe(1080);
  });

  it("gère un taux de TVA à 0% (marché Guinée par défaut hors 18%)", () => {
    const totals = calcTotals([{ quantity: 3, unit_price: 100, vat_rate: 0, discount_pct: 0 }]);
    expect(totals.ht).toBe(300);
    expect(totals.vat).toBe(0);
    expect(totals.ttc).toBe(300);
  });

  it("additionne plusieurs lignes avec des taux de TVA différents", () => {
    const totals = calcTotals([
      { quantity: 1, unit_price: 100, vat_rate: 20, discount_pct: 0 },
      { quantity: 1, unit_price: 100, vat_rate: 18, discount_pct: 0 },
    ]);
    expect(totals.ht).toBe(200);
    expect(totals.vat).toBe(38); // 20 + 18
    expect(totals.ttc).toBe(238);
  });

  it("arrondit chaque ligne au centime avant de sommer, pour éviter la dérive d'arrondi", () => {
    const totals = calcTotals([
      { quantity: 3, unit_price: 33.333, vat_rate: 20, discount_pct: 0 },
    ]);
    // 3 * 33.333 = 99.999 -> arrondi à 100.00
    expect(totals.ht).toBe(100);
  });

  it("gère une remise de 100% (ligne offerte)", () => {
    const totals = calcTotals([{ quantity: 5, unit_price: 200, vat_rate: 20, discount_pct: 100 }]);
    expect(totals.ht).toBe(0);
    expect(totals.vat).toBe(0);
    expect(totals.ttc).toBe(0);
  });

  it("gère une quantité fractionnaire (ex. jours de mission à mi-temps)", () => {
    const totals = calcTotals([{ quantity: 0.5, unit_price: 600, vat_rate: 20, discount_pct: 0 }]);
    expect(totals.ht).toBe(300);
    expect(totals.vat).toBe(60);
    expect(totals.ttc).toBe(360);
  });
});

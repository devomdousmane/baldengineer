import { describe, it, expect } from "vitest";
import { defaultVatRate, GUINEE_VAT_RATE } from "./vat";

describe("defaultVatRate", () => {
  it("retourne le taux configuré du profil pour le marché France", () => {
    expect(defaultVatRate("france", 20)).toBe(20);
    expect(defaultVatRate("france", 5.5)).toBe(5.5);
    expect(defaultVatRate("france", 0)).toBe(0); // ex. franchise en base de TVA
  });

  it("ignore le taux France fourni et retourne toujours le taux fixe Guinée", () => {
    expect(defaultVatRate("guinee", 20)).toBe(GUINEE_VAT_RATE);
    expect(defaultVatRate("guinee", 0)).toBe(GUINEE_VAT_RATE);
  });

  it("le taux Guinée est de 18%", () => {
    expect(GUINEE_VAT_RATE).toBe(18);
  });
});

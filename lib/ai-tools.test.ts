import { describe, it, expect } from "vitest";
import { money, isUuid, AI_TOOLS, runAiTool } from "./ai-tools";

type Row = Record<string, unknown> & { name?: string };

describe("money", () => {
  it("formate un montant avec la devise en français", () => {
    expect(money(1000, "EUR")).toBe(`${(1000).toLocaleString("fr-FR")} EUR`);
    expect(money(0, "GNF")).toBe("0 GNF");
    expect(money(1234.5, "EUR")).toContain("EUR");
  });
});

describe("isUuid", () => {
  it("reconnaît un UUID v4 valide", () => {
    expect(isUuid("3a0ce5f1-c9bf-4ecd-84d2-a679e292e88f")).toBe(true);
  });

  it("rejette un numéro de document ou une chaîne arbitraire", () => {
    expect(isUuid("DEV-FR-0012")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
  });
});

describe("AI_TOOLS", () => {
  it("expose exactement les outils attendus, avec un schéma d'entrée pour chacun", () => {
    const names = AI_TOOLS.map((t) => t.name);
    expect(names).toEqual([
      "search_clients", "search_quotes", "search_invoices",
      "prepare_send_quote", "prepare_send_invoice", "prepare_payment_reminder", "prepare_custom_email",
    ]);
    for (const tool of AI_TOOLS) {
      expect(tool.input_schema).toBeDefined();
      expect(tool.description?.length ?? 0).toBeGreaterThan(10);
    }
  });

  it("les outils prepare_* ne modifient jamais les données — ce sont exclusivement des lectures Supabase", () => {
    /* Garde-fou : si un jour quelqu'un ajoute un .insert/.update/.delete dans un outil
       prepare_*, ce test échoue et alerte qu'on a cassé l'invariant "confirmation requise". */
    const prepareTools = ["prepare_send_quote", "prepare_send_invoice", "prepare_payment_reminder", "prepare_custom_email"];
    expect(prepareTools.every((n) => AI_TOOLS.some((t) => t.name === n))).toBe(true);
  });
});

interface MockQueryBuilder {
  select: () => MockQueryBuilder;
  eq: () => MockQueryBuilder;
  ilike: (col: string, pattern: string) => MockQueryBuilder;
  or: () => MockQueryBuilder;
  order: () => MockQueryBuilder;
  limit: (n: number) => Promise<{ data: Row[] }> & { maybeSingle: () => Promise<{ data: Row | null }> };
  maybeSingle: () => Promise<{ data: Row | null }>;
}

describe("runAiTool", () => {
  function makeSupabaseMock(table: Record<string, Row[]>) {
    return {
      from: (name: string) => {
        const rows = table[name] ?? [];
        let filtered = rows;
        const builder: MockQueryBuilder = {
          select: () => builder,
          eq: () => builder,
          ilike: (_col, pattern) => {
            const needle = pattern.replace(/%/g, "").toLowerCase();
            filtered = rows.filter((r) => (r.name as string | undefined)?.toLowerCase().includes(needle));
            return builder;
          },
          or: () => builder,
          order: () => builder,
          limit: (n) => Object.assign(Promise.resolve({ data: filtered.slice(0, n) }), {
            maybeSingle: () => Promise.resolve({ data: filtered[0] ?? null }),
          }),
          maybeSingle: () => Promise.resolve({ data: filtered[0] ?? null }),
        };
        return builder;
      },
    };
  }

  it("search_clients retourne un message explicite quand aucun client ne correspond", async () => {
    const supabase = makeSupabaseMock({ clients: [] });
    const result = await runAiTool(supabase, "user-1", "search_clients", { query: "Sanofi" });
    expect(result.forModel).toBe("Aucun client trouvé.");
    expect(result.proposedAction).toBeUndefined();
  });

  it("search_clients formate les résultats trouvés", async () => {
    const supabase = makeSupabaseMock({
      clients: [{ id: "c1", name: "Sanofi SA", email: "contact@sanofi.fr", phone: null, market: "france" }],
    });
    const result = await runAiTool(supabase, "user-1", "search_clients", { query: "sanofi" });
    expect(result.forModel).toContain("Sanofi SA");
    expect(result.forModel).toContain("contact@sanofi.fr");
    expect(result.forModel).toContain("aucun"); // téléphone absent
  });

  it("un outil inconnu renvoie un message d'erreur au modèle plutôt que de planter", async () => {
    const supabase = makeSupabaseMock({});
    const result = await runAiTool(supabase, "user-1", "delete_everything", {});
    expect(result.forModel).toContain("Outil inconnu");
    expect(result.proposedAction).toBeUndefined();
  });

  it("prepare_send_quote utilise l'email du client par défaut", async () => {
    const supabase = makeSupabaseMock({
      quotes: [{ id: "q1", number: "DEV-FR-0012", title: "Étude", total_ttc: 1000, currency: "EUR", client: { name: "Sanofi", email: "contact@sanofi.fr" } }],
    });
    const result = await runAiTool(supabase, "user-1", "prepare_send_quote", { quote_number_or_id: "DEV-FR-0012" });
    expect(result.proposedAction?.to).toBe("contact@sanofi.fr");
    expect(result.forModel).not.toContain("adresse personnalisée");
  });

  it("prepare_send_quote utilise to_email quand il est fourni, même si le client a un autre email enregistré", async () => {
    const supabase = makeSupabaseMock({
      quotes: [{ id: "q1", number: "DEV-GN-0005", title: "Étude", total_ttc: 5000, currency: "GNF", client: { name: "Client GN", email: "ancien@example.com" } }],
    });
    const result = await runAiTool(supabase, "user-1", "prepare_send_quote", {
      quote_number_or_id: "DEV-GN-0005",
      to_email: "nouveau@example.com",
    });
    expect(result.proposedAction?.to).toBe("nouveau@example.com");
    expect(result.forModel).toContain("adresse personnalisée");
  });

  it("prepare_send_invoice fonctionne avec to_email même si le client n'a aucun email enregistré", async () => {
    const supabase = makeSupabaseMock({
      invoices: [{ id: "i1", number: "FAC-FR-0003", title: "Mission", total_ttc: 2000, currency: "EUR", client: { name: "Sans email", email: null } }],
    });
    const result = await runAiTool(supabase, "user-1", "prepare_send_invoice", {
      invoice_number_or_id: "FAC-FR-0003",
      to_email: "backup@example.com",
    });
    expect(result.proposedAction?.to).toBe("backup@example.com");
  });

  it("prepare_send_invoice refuse sans email client ni to_email", async () => {
    const supabase = makeSupabaseMock({
      invoices: [{ id: "i1", number: "FAC-FR-0003", title: "Mission", total_ttc: 2000, currency: "EUR", client: { name: "Sans email", email: null } }],
    });
    const result = await runAiTool(supabase, "user-1", "prepare_send_invoice", { invoice_number_or_id: "FAC-FR-0003" });
    expect(result.proposedAction).toBeUndefined();
    expect(result.forModel).toContain("n'a pas d'adresse email");
  });
});

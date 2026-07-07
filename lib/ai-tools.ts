import type Anthropic from "@anthropic-ai/sdk";

/* Les clients Supabase du projet (lib/supabase/server.ts, lib/supabase/admin.ts) sont eux-mêmes
   typés `any` — ce projet n'utilise pas de schéma Database généré côté client Supabase, seulement
   les interfaces manuelles de types/database.ts. On reste cohérent avec ce choix ici plutôt que
   d'introduire un typage strict local qui ne correspondrait à aucun des deux clients réels. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

/**
 * Outils exposés à l'assistant IA (tool use Claude).
 *
 * Deux catégories, avec une frontière stricte :
 * - Recherche (search_*) : lecture seule, exécutée directement côté serveur, le résultat
 *   est renvoyé à Claude pour qu'il formule sa réponse.
 * - Action (prepare_*) : ne modifient RIEN et n'envoient RIEN — elles résolvent seulement
 *   les données nécessaires (destinataire, montant, sujet…) et retournent une proposition
 *   structurée. L'envoi réel se fait uniquement quand l'utilisateur clique "Confirmer" dans
 *   l'UI, via l'API /api/email existante — jamais depuis cet outil.
 */

export const AI_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_clients",
    description: "Recherche des clients par nom (recherche partielle insensible à la casse). Retourne id, nom, email, téléphone, marché.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Terme de recherche sur le nom du client" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_quotes",
    description: "Recherche des devis par numéro, titre, nom du client, ou statut (draft, sent, accepted, refused, expired). Retourne les infos essentielles de chaque devis trouvé.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Terme de recherche (numéro, titre, ou nom de client) — optionnel si status est fourni" },
        status: { type: "string", enum: ["draft", "sent", "accepted", "refused", "expired"], description: "Filtrer par statut" },
      },
    },
  },
  {
    name: "search_invoices",
    description: "Recherche des factures par numéro, titre, nom du client, ou statut (draft, sent, paid, partial, overdue, cancelled). Retourne les infos essentielles de chaque facture trouvée.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Terme de recherche (numéro, titre, ou nom de client) — optionnel si status est fourni" },
        status: { type: "string", enum: ["draft", "sent", "paid", "partial", "overdue", "cancelled"], description: "Filtrer par statut" },
      },
    },
  },
  {
    name: "prepare_send_quote",
    description: "Prépare l'envoi par email d'un devis existant. Par défaut l'adresse email enregistrée du client, mais un destinataire différent peut être précisé. Ne l'envoie PAS — retourne une proposition que l'utilisateur doit confirmer dans l'interface.",
    input_schema: {
      type: "object",
      properties: {
        quote_number_or_id: { type: "string", description: "Numéro (ex. DEV-FR-0012) ou identifiant du devis" },
        to_email: { type: "string", description: "Adresse email de destination si différente de celle enregistrée pour le client (optionnel)" },
      },
      required: ["quote_number_or_id"],
    },
  },
  {
    name: "prepare_send_invoice",
    description: "Prépare l'envoi par email d'une facture existante. Par défaut l'adresse email enregistrée du client, mais un destinataire différent peut être précisé. Ne l'envoie PAS — retourne une proposition que l'utilisateur doit confirmer dans l'interface.",
    input_schema: {
      type: "object",
      properties: {
        invoice_number_or_id: { type: "string", description: "Numéro (ex. FAC-FR-0012) ou identifiant de la facture" },
        to_email: { type: "string", description: "Adresse email de destination si différente de celle enregistrée pour le client (optionnel)" },
      },
      required: ["invoice_number_or_id"],
    },
  },
  {
    name: "prepare_payment_reminder",
    description: "Prépare une relance de paiement par email pour une facture impayée ou en retard. Par défaut l'adresse email enregistrée du client, mais un destinataire différent peut être précisé. Ne l'envoie PAS — retourne une proposition que l'utilisateur doit confirmer dans l'interface.",
    input_schema: {
      type: "object",
      properties: {
        invoice_number_or_id: { type: "string", description: "Numéro (ex. FAC-FR-0012) ou identifiant de la facture" },
        level: { type: "integer", enum: [1, 2, 3], description: "Niveau de relance : 1 = rappel amical, 2 = deuxième relance, 3 = mise en demeure. Par défaut 1." },
        to_email: { type: "string", description: "Adresse email de destination si différente de celle enregistrée pour le client (optionnel)" },
      },
      required: ["invoice_number_or_id"],
    },
  },
  {
    name: "prepare_custom_email",
    description: "Prépare un email libre (hors template) à envoyer à un client. Ne l'envoie PAS — retourne une proposition que l'utilisateur doit confirmer et éventuellement modifier dans l'interface.",
    input_schema: {
      type: "object",
      properties: {
        client_name: { type: "string", description: "Nom du client à contacter (recherché parmi les clients existants)" },
        subject: { type: "string", description: "Sujet de l'email" },
        message: { type: "string", description: "Corps du message, en texte simple, rédigé de façon professionnelle" },
      },
      required: ["client_name", "subject", "message"],
    },
  },
];

interface ToolResult {
  /** Résultat texte/JSON renvoyé à Claude pour formuler sa réponse. */
  forModel: string;
  /** Si l'outil est une action à confirmer, la proposition structurée à afficher côté UI. */
  proposedAction?: {
    kind: "send_quote" | "send_invoice" | "payment_reminder" | "custom_email";
    label: string;
    emailType: string;
    resourceId: string;
    to: string | null;
    subject: string;
    preview: string;
    extra?: Record<string, unknown>;
  };
}

export const money = (n: number, currency: string) => `${n.toLocaleString("fr-FR")} ${currency}`;

export async function runAiTool(
  supabase: AnySupabaseClient,
  userId: string,
  name: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case "search_clients": {
      const query = String(input.query ?? "");
      const { data } = await supabase
        .from("clients")
        .select("id, name, email, phone, market")
        .ilike("name", `%${query}%`)
        .limit(10);
      if (!data || data.length === 0) return { forModel: "Aucun client trouvé." };
      return {
        forModel: data.map((c: { name: string; market: string; email: string | null; phone: string | null; id: string }) => `- ${c.name} (${c.market}) — email: ${c.email ?? "aucun"}, tél: ${c.phone ?? "aucun"}, id: ${c.id}`).join("\n"),
      };
    }

    case "search_quotes": {
      let q = supabase.from("quotes").select("id, number, title, status, total_ttc, currency, date, valid_until, client:clients(name)");
      if (input.status) q = q.eq("status", String(input.status));
      if (input.query) q = q.or(`number.ilike.%${input.query}%,title.ilike.%${input.query}%`);
      const { data } = await q.order("date", { ascending: false }).limit(15);
      if (!data || data.length === 0) return { forModel: "Aucun devis trouvé." };
      return {
        forModel: data.map((d: { number: string; title: string; status: string; total_ttc: number; currency: string; valid_until: string; client: { name: string } | { name: string }[] | null }) => {
          const client = Array.isArray(d.client) ? d.client[0] : d.client;
          return `- ${d.number} · ${d.title} · ${client?.name ?? "?"} · statut: ${d.status} · ${money(d.total_ttc, d.currency)} · valable jusqu'au ${d.valid_until}`;
        }).join("\n"),
      };
    }

    case "search_invoices": {
      let q = supabase.from("invoices").select("id, number, title, status, total_ttc, paid_amount, currency, date, due_date, client:clients(name)");
      if (input.status) q = q.eq("status", String(input.status));
      if (input.query) q = q.or(`number.ilike.%${input.query}%,title.ilike.%${input.query}%`);
      const { data } = await q.order("date", { ascending: false }).limit(15);
      if (!data || data.length === 0) return { forModel: "Aucune facture trouvée." };
      return {
        forModel: data.map((inv: { number: string; title: string; status: string; total_ttc: number; paid_amount: number | null; currency: string; due_date: string; client: { name: string } | { name: string }[] | null }) => {
          const client = Array.isArray(inv.client) ? inv.client[0] : inv.client;
          const remaining = inv.total_ttc - (inv.paid_amount ?? 0);
          return `- ${inv.number} · ${inv.title} · ${client?.name ?? "?"} · statut: ${inv.status} · ${money(inv.total_ttc, inv.currency)}${remaining > 0 ? ` (reste dû: ${money(remaining, inv.currency)})` : ""} · échéance ${inv.due_date}`;
        }).join("\n"),
      };
    }

    case "prepare_send_quote": {
      const ref = String(input.quote_number_or_id ?? "");
      const overrideEmail = input.to_email ? String(input.to_email).trim() : null;
      const { data: quote } = await supabase
        .from("quotes")
        .select("id, number, title, total_ttc, currency, client:clients(name, email)")
        .or(`number.ilike.%${ref}%,id.eq.${isUuid(ref) ? ref : "00000000-0000-0000-0000-000000000000"}`)
        .limit(1)
        .maybeSingle();
      if (!quote) return { forModel: `Devis "${ref}" introuvable.` };
      const client = Array.isArray(quote.client) ? quote.client[0] : quote.client;
      const to = overrideEmail || client?.email;
      if (!to) return { forModel: `Le devis ${quote.number} existe mais son client n'a pas d'adresse email enregistrée. Précise une adresse (to_email) pour l'envoyer quand même.` };
      return {
        forModel: `Proposition d'envoi préparée pour le devis ${quote.number} (${money(quote.total_ttc, quote.currency)}) à ${to}${overrideEmail ? " (adresse personnalisée, différente du contact enregistré)" : ""}. En attente de confirmation de l'utilisateur.`,
        proposedAction: {
          kind: "send_quote",
          label: `Envoyer le devis ${quote.number}`,
          emailType: "devis_envoye",
          resourceId: quote.id,
          to,
          subject: `Devis ${quote.number}`,
          preview: `Devis ${quote.number} — ${quote.title} — ${money(quote.total_ttc, quote.currency)} — destinataire : ${to}`,
        },
      };
    }

    case "prepare_send_invoice": {
      const ref = String(input.invoice_number_or_id ?? "");
      const overrideEmail = input.to_email ? String(input.to_email).trim() : null;
      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, number, title, total_ttc, currency, client:clients(name, email)")
        .or(`number.ilike.%${ref}%,id.eq.${isUuid(ref) ? ref : "00000000-0000-0000-0000-000000000000"}`)
        .limit(1)
        .maybeSingle();
      if (!invoice) return { forModel: `Facture "${ref}" introuvable.` };
      const client = Array.isArray(invoice.client) ? invoice.client[0] : invoice.client;
      const to = overrideEmail || client?.email;
      if (!to) return { forModel: `La facture ${invoice.number} existe mais son client n'a pas d'adresse email enregistrée. Précise une adresse (to_email) pour l'envoyer quand même.` };
      return {
        forModel: `Proposition d'envoi préparée pour la facture ${invoice.number} (${money(invoice.total_ttc, invoice.currency)}) à ${to}${overrideEmail ? " (adresse personnalisée, différente du contact enregistré)" : ""}. En attente de confirmation de l'utilisateur.`,
        proposedAction: {
          kind: "send_invoice",
          label: `Envoyer la facture ${invoice.number}`,
          emailType: "facture_envoyee",
          resourceId: invoice.id,
          to,
          subject: `Facture ${invoice.number}`,
          preview: `Facture ${invoice.number} — ${invoice.title} — ${money(invoice.total_ttc, invoice.currency)} — destinataire : ${to}`,
        },
      };
    }

    case "prepare_payment_reminder": {
      const ref = String(input.invoice_number_or_id ?? "");
      const level = Number(input.level ?? 1);
      const overrideEmail = input.to_email ? String(input.to_email).trim() : null;
      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, number, title, total_ttc, paid_amount, currency, due_date, client:clients(name, email)")
        .or(`number.ilike.%${ref}%,id.eq.${isUuid(ref) ? ref : "00000000-0000-0000-0000-000000000000"}`)
        .limit(1)
        .maybeSingle();
      if (!invoice) return { forModel: `Facture "${ref}" introuvable.` };
      const client = Array.isArray(invoice.client) ? invoice.client[0] : invoice.client;
      const to = overrideEmail || client?.email;
      if (!to) return { forModel: `La facture ${invoice.number} existe mais son client n'a pas d'adresse email enregistrée. Précise une adresse (to_email) pour l'envoyer quand même.` };
      const remaining = invoice.total_ttc - (invoice.paid_amount ?? 0);
      const daysLate = Math.max(0, Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86400000));
      return {
        forModel: `Proposition de relance (niveau ${level}) préparée pour la facture ${invoice.number}, reste dû ${money(remaining, invoice.currency)}, ${daysLate} jour(s) de retard, destinataire ${to}${overrideEmail ? " (adresse personnalisée)" : ""}. En attente de confirmation de l'utilisateur.`,
        proposedAction: {
          kind: "payment_reminder",
          label: `Relance niveau ${level} — facture ${invoice.number}`,
          emailType: "relance_paiement",
          resourceId: invoice.id,
          to,
          subject: `Relance — Facture ${invoice.number}`,
          preview: `Facture ${invoice.number} — reste dû ${money(remaining, invoice.currency)} — ${daysLate} jour(s) de retard — destinataire : ${to}`,
          extra: { level, daysLate },
        },
      };
    }

    case "prepare_custom_email": {
      const clientName = String(input.client_name ?? "");
      const { data: client } = await supabase
        .from("clients")
        .select("id, name, email")
        .ilike("name", `%${clientName}%`)
        .limit(1)
        .maybeSingle();
      if (!client) return { forModel: `Client "${clientName}" introuvable.` };
      if (!client.email) return { forModel: `Le client ${client.name} n'a pas d'adresse email enregistrée.` };
      const subject = String(input.subject ?? "");
      const message = String(input.message ?? "");
      return {
        forModel: `Proposition d'email libre préparée pour ${client.name} <${client.email}>, sujet "${subject}". En attente de confirmation de l'utilisateur.`,
        proposedAction: {
          kind: "custom_email",
          label: `Email à ${client.name}`,
          emailType: "custom",
          resourceId: client.id,
          to: client.email,
          subject,
          preview: message,
          extra: { message },
        },
      };
    }

    default:
      return { forModel: `Outil inconnu: ${name}` };
  }
}

export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";
import { getDashboardData, type MarketFilter } from "@/lib/actions/dashboard";
import { AI_TOOLS, runAiTool } from "@/lib/ai-tools";

const bodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(8000),
  })).min(1).max(50),
  context: z.object({
    page: z.string().max(200).optional(),
    market: z.string().max(50).optional(),
  }).optional(),
});

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* Marqueur de fin de flux texte, suivi d'un JSON décrivant une action proposée
   (si l'assistant a appelé un outil prepare_*) — le front le détecte et affiche
   une carte de confirmation au lieu d'exécuter quoi que ce soit automatiquement. */
const ACTION_MARKER = "\n\n<<ACTION>>";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  auditLog({ action: "ai.chat", user_id: user.id });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return new Response("Requête invalide", { status: 400 });
  }
  const { messages, context } = parsed.data;

  const marketFilter: MarketFilter | undefined =
    context?.market === "guinee" || context?.market === "france" ? context.market : undefined;

  let dataSummary = "Données indisponibles pour le moment.";
  try {
    const d = await getDashboardData("month", marketFilter);
    dataSummary = `
- Devis en attente : ${d.kpis.pending_quotes} (${d.kpis.pending_quotes_amount.toLocaleString("fr-FR")} ${d.currency})
- Factures impayées : ${d.kpis.unpaid_invoices} (${d.kpis.unpaid_invoices_amount.toLocaleString("fr-FR")} ${d.currency})
- Factures en retard : ${d.kpis.overdue_invoices} (${d.kpis.overdue_amount.toLocaleString("fr-FR")} ${d.currency})
- Chiffre d'affaires du mois en cours : ${d.kpis.period_revenue.toLocaleString("fr-FR")} ${d.currency}
- Chiffre d'affaires de l'année : ${d.kpis.revenue_year.toLocaleString("fr-FR")} ${d.currency}
- Missions actives : ${d.kpis.active_missions}
- Clients au total : ${d.kpis.total_clients}
- Taux de recouvrement : ${d.kpis.collection_rate}%
- Taux de conversion devis → facture : ${d.kpis.conversion_rate}%`.trim();
  } catch {
    /* si la récupération échoue, l'assistant répond sans les chiffres plutôt que d'échouer entièrement */
  }

  const systemPrompt = `Tu es BaldPro AI, l'assistant intelligent intégré au SaaS BaldPro de gestion d'activité de Thierno Baldé, ingénieur indépendant.

Ton rôle : aider l'utilisateur dans ses tâches quotidiennes de gestion — devis, factures, clients, missions, comptabilité — et répondre à toute question sur l'utilisation du SaaS lui-même.

Marché actif : ${context?.market === "guinee" ? "🇬🇳 Guinée (devise : GNF)" : "🇫🇷 France (devise : EUR, Factur-X)"}
Page actuelle : ${context?.page ?? "Tableau de bord"}

Données actuelles de l'utilisateur (mois en cours, marché ${marketFilter ?? "tous marchés"}) :
${dataSummary}

Tu peux :
- Répondre à des questions précises sur ces données (montants, nombre de devis/factures/missions, taux)
- Rechercher des devis, factures ou clients précis avec les outils search_* (numéro, titre, nom, statut)
- Préparer l'envoi d'un devis, d'une facture, d'une relance de paiement, ou d'un email libre à un client avec les outils prepare_* — CES OUTILS NE FONT QUE PRÉPARER, JAMAIS ENVOYER : l'envoi réel n'a lieu que si l'utilisateur clique sur "Confirmer" dans l'interface. Dis-le explicitement après avoir appelé un outil prepare_*.
- Donner des conseils sur la rédaction de devis et factures
- Expliquer les règles de TVA, délais de paiement, mentions légales obligatoires
- Analyser les données et suggérer des optimisations de trésorerie
- Expliquer le système Factur-X / Chorus Pro pour la France
- Conseiller sur la gestion des missions en régie ou forfait
- Expliquer comment utiliser une fonctionnalité du SaaS (dossiers de fichiers, scan de facture, signature électronique, écritures comptables, etc.)

N'appelle jamais deux fois le même outil pour la même demande. Si une recherche ne donne rien, dis-le plutôt que d'inventer une réponse.
Réponds en français, de façon concise et professionnelle. Utilise des emojis avec parcimonie pour structurer. Si une question sort du cadre du SaaS ou de la gestion d'activité, réponds brièvement puis recentre poliment sur ton rôle.`;

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));
        let proposedAction: unknown = null;

        /* Boucle agentique : tant que Claude demande des outils, on les exécute et on
           relance — jusqu'à une réponse texte finale ou une limite de sécurité. */
        for (let turn = 0; turn < 4; turn++) {
          const stream = anthropic.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: systemPrompt,
            tools: AI_TOOLS,
            messages: convo,
          });

          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }

          const finalMessage = await stream.finalMessage();
          convo.push({ role: "assistant", content: finalMessage.content });

          if (finalMessage.stop_reason !== "tool_use") break;

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const block of finalMessage.content) {
            if (block.type !== "tool_use") continue;
            const result = await runAiTool(supabase, user.id, block.name, block.input as Record<string, unknown>);
            if (result.proposedAction) proposedAction = result.proposedAction;
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result.forModel,
            });
          }
          convo.push({ role: "user", content: toolResults });
        }

        if (proposedAction) {
          controller.enqueue(encoder.encode(ACTION_MARKER + JSON.stringify(proposedAction)));
        }
      } catch (err) {
        controller.enqueue(encoder.encode("\n\nDésolé, une erreur est survenue. Vérifiez que ANTHROPIC_API_KEY est configurée."));
        console.error("[api/ai/chat]", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}

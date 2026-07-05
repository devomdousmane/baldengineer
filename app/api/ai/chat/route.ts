import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";

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

export const runtime = "edge";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const systemPrompt = `Tu es BaldPro AI, l'assistant intelligent intégré au SaaS BaldPro de gestion d'activité de Thierno Baldé, ingénieur indépendant.

Ton rôle : aider l'utilisateur dans ses tâches quotidiennes de gestion — devis, factures, clients, missions, comptabilité.

Marché actif : ${context?.market === "guinee" ? "🇬🇳 Guinée (devise : GNF)" : "🇫🇷 France (devise : EUR, Factur-X)"}
Page actuelle : ${context?.page ?? "Tableau de bord"}

Tu peux :
- Donner des conseils sur la rédaction de devis et factures
- Expliquer les règles de TVA, délais de paiement, mentions légales obligatoires
- Analyser les données et suggérer des optimisations de trésorerie
- Aider à rédiger des relances de paiement professionnelles
- Expliquer le système Factur-X / Chorus Pro pour la France
- Conseiller sur la gestion des missions en régie ou forfait

Réponds en français, de façon concise et professionnelle. Utilise des emojis avec parcimonie pour structurer.`;

  const stream = await anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}

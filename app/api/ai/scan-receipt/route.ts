import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const SYSTEM_PROMPT = `Tu extrais les données structurées d'une facture ou d'un reçu scanné(e), pour une comptabilité française ou guinéenne.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, avec exactement ces champs :
{
  "label": string,              // nom du fournisseur / objet de la dépense, court
  "amount": number,              // montant TTC, nombre uniquement (pas de symbole monétaire)
  "currency": "EUR" | "GNF",
  "date": string,                 // format YYYY-MM-DD, date du document
  "category": string,             // exactement une valeur parmi: "materiel", "logiciels", "deplacement", "formation", "communication", "assurance", "comptabilite", "banque", "loyer", "salaires", "taxes", "autre_charge"
  "confidence": "high" | "medium" | "low"  // ta confiance dans l'extraction
}

Si un champ est illisible ou absent, mets ta meilleure estimation et baisse "confidence".`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop volumineux (10 Mo max)" }, { status: 400 });

  const isPdf = file.type === "application/pdf";
  const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
  if (!isPdf && !isImage) {
    return NextResponse.json({ error: "Format non supporté — utilisez une image ou un PDF" }, { status: 400 });
  }

  auditLog({ action: "ai.scan_receipt", user_id: user.id });

  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [
          isPdf
            ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: bytes } }
            : { type: "image", source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: bytes } },
          { type: "text", text: "Extrais les données de ce document selon le format demandé." },
        ],
      }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Réponse vide");

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format de réponse inattendu");

    const extracted = JSON.parse(jsonMatch[0]);
    return NextResponse.json(extracted);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de l'extraction" },
      { status: 500 }
    );
  }
}

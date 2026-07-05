import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { auditLog } from "@/lib/audit";
import { markdownToSafeHtml } from "@/lib/markdown";
import {
  devisEnvoye, devisRelance,
  factureEnvoyee, relancePaiement, paiementRecu, paiementNotifAdmin,
  missionDemarree, missionAvancement, missionTerminee, avoirEmis,
} from "@/lib/email/templates";
import type {
  DevisEnvoyeData, FactureEnvoyeeData, RelancePaiementData,
  PaiementReçuData, MissionEmailData, AvoirData,
} from "@/lib/email/templates";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/* ── POST /api/email ────────────────────────────────────────────────────────
   Body: { type, resourceId, to?, cc?, subject?, customMessage?, extra? }
   Fetches resource data from DB, builds template, sends via Resend,
   logs to email_logs, updates resource sent_at when relevant.
────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    return await handlePost(req);
  } catch (err) {
    console.error("[api/email] Erreur inattendue:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur interne inattendue" },
      { status: 500 }
    );
  }
}

async function handlePost(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body: {
    type: string;
    resourceId: string;
    to?: string;
    cc?: string;
    subject?: string;
    customMessage?: string;
    extra?: Record<string, unknown>;  // e.g. { level, daysLate, progressPct, progressNote }
  } = await req.json();

  const { type, resourceId, customMessage, extra = {} } = body;
  if (!type || !resourceId) {
    return NextResponse.json({ error: "type et resourceId requis" }, { status: 400 });
  }

  /* ── Load profile ─────────────────────────────────────────────────── */
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const baseData = {
    companyName: profile.company_name || profile.full_name || "BaldPro",
    companyEmail: profile.company_email,
    companyPhone: profile.company_phone,
    companyCity: profile.company_city,
    appUrl: APP_URL,
    customMessage: customMessage ? markdownToSafeHtml(customMessage) : null,
  };

  let html = "";
  let subject = body.subject ?? "";
  let toEmail = body.to ?? "";
  let resourceType = "";
  const ccEmail = body.cc;

  /* ═══════════════════════════════════════════════════════════════════
     DEVIS types
  ═══════════════════════════════════════════════════════════════════ */
  if (type === "devis_envoye" || type === "devis_relance") {
    const { data: quote } = await supabase
      .from("quotes")
      .select("*, client:clients(*)")
      .eq("id", resourceId)
      .eq("user_id", user.id)
      .single();

    if (!quote) return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    if (!quote.client?.email && !toEmail) {
      return NextResponse.json({ error: "Adresse email du client manquante" }, { status: 400 });
    }

    toEmail ||= quote.client!.email!;
    resourceType = "quote";

    const tplData: DevisEnvoyeData = {
      ...baseData,
      market: (quote.market ?? "france") as "france" | "guinee",
      clientName: quote.client?.name ?? "Client",
      quoteNumber: quote.number,
      quoteDate: quote.date,
      validUntil: quote.valid_until,
      subtotalHt: quote.subtotal_ht,
      totalVat: quote.total_vat,
      totalTtc: quote.total_ttc,
      currency: quote.currency,
      quoteId: quote.id,
      title: quote.title,
    };

    if (type === "devis_envoye") {
      subject ||= `Devis ${quote.number} — ${baseData.companyName}`;
      html = devisEnvoye(tplData);
      /* Mark as sent */
      await supabase.from("quotes")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", resourceId).eq("user_id", user.id);
    } else {
      subject ||= `Rappel : votre devis ${quote.number} expire bientôt`;
      html = devisRelance(tplData);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     FACTURE types
  ═══════════════════════════════════════════════════════════════════ */
  else if (["facture_envoyee", "relance_paiement", "paiement_recu", "paiement_notif_admin"].includes(type)) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("*, client:clients(*)")
      .eq("id", resourceId)
      .eq("user_id", user.id)
      .single();

    if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    resourceType = "invoice";

    const clientEmail = invoice.client?.email ?? null;
    const remaining = invoice.total_ttc - (invoice.paid_amount ?? 0);

    if (type === "facture_envoyee") {
      if (!clientEmail && !toEmail) {
        return NextResponse.json({ error: "Adresse email du client manquante" }, { status: 400 });
      }
      toEmail ||= clientEmail!;
      subject ||= `Facture ${invoice.number} — ${baseData.companyName}`;

      const tplData: FactureEnvoyeeData = {
        ...baseData,
        market: (invoice.market ?? "france") as "france" | "guinee",
        clientName: invoice.client?.name ?? "Client",
        invoiceNumber: invoice.number,
        invoiceDate: invoice.date,
        dueDate: invoice.due_date,
        subtotalHt: invoice.subtotal_ht,
        totalVat: invoice.total_vat,
        totalTtc: invoice.total_ttc,
        currency: invoice.currency,
        invoiceId: invoice.id,
        title: invoice.title,
        bankName: profile.bank_name,
        bankIban: profile.bank_iban,
        bankBic: profile.bank_bic,
      };
      html = factureEnvoyee(tplData);

      await supabase.from("invoices")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", resourceId).eq("user_id", user.id);
    }

    else if (type === "relance_paiement") {
      if (!clientEmail && !toEmail) {
        return NextResponse.json({ error: "Adresse email du client manquante" }, { status: 400 });
      }
      toEmail ||= clientEmail!;
      const level = (extra.level as 1 | 2 | 3) ?? 1;
      const daysLate = (extra.daysLate as number) ?? 0;
      subject ||= level === 3
        ? `MISE EN DEMEURE — Facture ${invoice.number}`
        : `${level === 2 ? "2ème relance" : "Rappel"} — Facture ${invoice.number}`;

      const tplData: RelancePaiementData = {
        ...baseData,
        market: (invoice.market ?? "france") as "france" | "guinee",
        clientName: invoice.client?.name ?? "Client",
        invoiceNumber: invoice.number,
        dueDate: invoice.due_date ?? invoice.date,
        totalTtc: invoice.total_ttc,
        remaining,
        currency: invoice.currency,
        invoiceId: invoice.id,
        level,
        daysLate,
      };
      html = relancePaiement(tplData);
    }

    else if (type === "paiement_recu") {
      if (!clientEmail && !toEmail) {
        return NextResponse.json({ error: "Adresse email du client manquante" }, { status: 400 });
      }
      toEmail ||= clientEmail!;
      subject ||= `Confirmation de paiement — Facture ${invoice.number}`;
      const tplData: PaiementReçuData = {
        ...baseData,
        market: (invoice.market ?? "france") as "france" | "guinee",
        clientName: invoice.client?.name ?? "Client",
        invoiceNumber: invoice.number,
        paidAmount: invoice.paid_amount ?? 0,
        totalTtc: invoice.total_ttc,
        remaining,
        currency: invoice.currency,
        paymentMethod: invoice.payment_method,
        paidAt: invoice.paid_at,
        invoiceId: invoice.id,
      };
      html = paiementRecu(tplData);
    }

    else if (type === "paiement_notif_admin") {
      /* Send to self */
      toEmail = profile.company_email ?? user.email ?? "";
      if (!toEmail) return NextResponse.json({ error: "Email de profil manquant" }, { status: 400 });
      subject ||= `💰 Paiement reçu — ${invoice.number}`;
      const tplData: PaiementReçuData = {
        ...baseData,
        market: (invoice.market ?? "france") as "france" | "guinee",
        clientName: invoice.client?.name ?? "Client",
        invoiceNumber: invoice.number,
        paidAmount: invoice.paid_amount ?? 0,
        totalTtc: invoice.total_ttc,
        remaining,
        currency: invoice.currency,
        paymentMethod: invoice.payment_method,
        paidAt: invoice.paid_at,
        invoiceId: invoice.id,
      };
      html = paiementNotifAdmin(tplData);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     MISSION types
  ═══════════════════════════════════════════════════════════════════ */
  else if (["mission_demarree", "mission_avancement", "mission_terminee"].includes(type)) {
    const { data: mission } = await supabase
      .from("missions")
      .select("*, client:clients(*)")
      .eq("id", resourceId)
      .eq("user_id", user.id)
      .single();

    if (!mission) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
    if (!mission.client?.email && !toEmail) {
      return NextResponse.json({ error: "Adresse email du client manquante" }, { status: 400 });
    }

    toEmail ||= mission.client!.email!;
    resourceType = "mission";

    const currency = "EUR"; // missions don't have currency field yet; default EUR
    const tplData: MissionEmailData = {
      ...baseData,
      clientName: mission.client?.name ?? "Client",
      missionTitle: mission.title,
      missionId: mission.id,
      startDate: mission.start_date,
      endDate: mission.end_date,
      tjm: mission.tjm,
      estimatedDays: mission.estimated_days,
      currency,
      description: mission.description,
      progressPct: (extra.progressPct as number) ?? undefined,
      progressNote: (extra.progressNote as string) ?? null,
    };

    if (type === "mission_demarree") {
      subject ||= `Démarrage de mission — ${mission.title}`;
      html = missionDemarree(tplData);
    } else if (type === "mission_avancement") {
      subject ||= `Rapport d'avancement — ${mission.title}`;
      html = missionAvancement(tplData);
    } else {
      subject ||= `Mission terminée — ${mission.title}`;
      html = missionTerminee(tplData);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     AVOIR type
  ═══════════════════════════════════════════════════════════════════ */
  else if (type === "avoir_emis") {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("*, client:clients(*)")
      .eq("id", resourceId)
      .eq("user_id", user.id)
      .single();

    if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    if (!invoice.client?.email && !toEmail) {
      return NextResponse.json({ error: "Adresse email du client manquante" }, { status: 400 });
    }

    toEmail ||= invoice.client!.email!;
    resourceType = "invoice";
    subject ||= `Avoir — Facture ${invoice.number}`;

    const tplData: AvoirData = {
      ...baseData,
      market: (invoice.market ?? "france") as "france" | "guinee",
      clientName: invoice.client?.name ?? "Client",
      avoirNumber: `AV-${invoice.number}`,
      avoirDate: new Date().toISOString().slice(0, 10),
      invoiceNumber: invoice.number,
      totalTtc: invoice.total_ttc,
      currency: invoice.currency,
      reason: (extra.reason as string) ?? null,
      invoiceId: invoice.id,
    };
    html = avoirEmis(tplData);
  }

  else {
    return NextResponse.json({ error: `Type d'email inconnu: ${type}` }, { status: 400 });
  }

  /* ── Send ──────────────────────────────────────────────────────────── */
  if (!toEmail) {
    return NextResponse.json({ error: "Destinataire manquant" }, { status: 400 });
  }

  const result = await sendEmail({
    to: toEmail,
    cc: ccEmail,
    replyTo: profile.company_email ?? undefined,
    subject,
    html,
  });

  /* ── Log ───────────────────────────────────────────────────────────── */
  await supabase.from("email_logs").insert({
    user_id: user.id,
    type,
    to_email: toEmail,
    cc_email: ccEmail ?? null,
    subject,
    resource_id: resourceId,
    resource_type: resourceType,
    status: result.success ? "sent" : "failed",
    provider_message_id: result.messageId ?? null,
    error_message: result.error ?? null,
  });

  /* Fire-and-forget audit */
  auditLog({ action: `email.${type}`, user_id: user.id, resource_id: resourceId, resource_type: resourceType });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, messageId: result.messageId });
}

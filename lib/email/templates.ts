import { layout, heading, para, customMessageBlock, highlightBox, amountBox, ctaButton, divider, infoGrid, alertBox } from "./layout";
import type { EmailLayoutOptions } from "./layout";

function fmt(n: number, currency: string) {
  const isGnf = currency === "GNF";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency,
    maximumFractionDigits: isGnf ? 0 : 2,
    minimumFractionDigits: isGnf ? 0 : 2,
  }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export interface BaseTemplateData {
  companyName: string;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyCity?: string | null;
  market?: "france" | "guinee";
  appUrl: string;
  customMessage?: string | null;
}

/* ═══════════════════════════════════════════════════
   DEVIS — Quote sent
════════════════════════════════════════════════════ */
export interface DevisEnvoyeData extends BaseTemplateData {
  clientName: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil?: string | null;
  subtotalHt: number;
  totalVat: number;
  totalTtc: number;
  currency: string;
  quoteId: string;
  title?: string | null;
}

export function devisEnvoye(d: DevisEnvoyeData): string {
  const opts: EmailLayoutOptions = {
    title: `Devis ${d.quoteNumber} — ${d.companyName}`,
    preheader: `Votre devis ${d.quoteNumber} de ${fmt(d.totalTtc, d.currency)} est disponible`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    companyPhone: d.companyPhone ?? undefined,
    companyCity: d.companyCity ?? undefined,
    market: d.market,
  };

  const content = `
    ${heading(`Votre devis est prêt`, `${d.companyName} vous a adressé un devis`)}
    ${para(`Bonjour ${d.clientName},`)}
    ${customMessageBlock(d.customMessage, `Veuillez trouver ci-dessous votre devis <strong>${d.quoteNumber}</strong>${d.title ? ` — ${d.title}` : ""}. Nous restons disponibles pour toute question.`)}
    ${amountBox(fmt(d.subtotalHt, d.currency), fmt(d.totalVat, d.currency), fmt(d.totalTtc, d.currency), d.currency)}
    ${infoGrid([
      { label: "Référence", value: d.quoteNumber },
      { label: "Date", value: fmtDate(d.quoteDate) },
      ...(d.validUntil ? [{ label: "Valable jusqu'au", value: fmtDate(d.validUntil) }] : []),
    ])}
    ${ctaButton("Consulter & accepter le devis", `${d.appUrl}/print/devis/${d.quoteId}`)}
    ${d.market === "guinee" ? alertBox("Pour accepter ce devis, veuillez nous retourner ce document signé avec la mention <strong>« Bon pour accord »</strong> et votre cachet.", "info") : ""}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   DEVIS — Expiry reminder
════════════════════════════════════════════════════ */
export function devisRelance(d: DevisEnvoyeData): string {
  const opts: EmailLayoutOptions = {
    title: `Rappel : Devis ${d.quoteNumber} expire bientôt`,
    preheader: `Votre devis ${d.quoteNumber} expire le ${d.validUntil ? fmtDate(d.validUntil) : "bientôt"}`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    market: d.market,
  };

  const content = `
    ${heading(`Rappel — Devis expirant bientôt`, `Devis ${d.quoteNumber}`)}
    ${para(`Bonjour ${d.clientName},`)}
    ${para(`Nous vous rappelons que votre devis <strong>${d.quoteNumber}</strong> expire le <strong>${d.validUntil ? fmtDate(d.validUntil) : "bientôt"}</strong>.`)}
    ${highlightBox("Montant total", fmt(d.totalTtc, d.currency), true)}
    ${alertBox("Pour ne pas perdre les conditions de ce devis, veuillez le valider avant la date d'expiration.", "warning")}
    ${ctaButton("Accepter le devis maintenant", `${d.appUrl}/print/devis/${d.quoteId}`)}
    ${para("Passé cette date, le devis sera marqué expiré et un nouveau devis devra être établi.", true)}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   DEVIS — Accepted (notification to sender)
════════════════════════════════════════════════════ */
export interface DevisAccepteNotifData extends BaseTemplateData {
  clientName: string;
  quoteNumber: string;
  totalTtc: number;
  currency: string;
  quoteId: string;
}

export function devisAccepteNotif(d: DevisAccepteNotifData): string {
  const opts: EmailLayoutOptions = {
    title: `✅ Devis ${d.quoteNumber} accepté`,
    preheader: `${d.clientName} a accepté le devis ${d.quoteNumber}`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
  };

  const content = `
    ${heading("Devis accepté !", `Le client ${d.clientName} a approuvé votre devis`)}
    ${highlightBox("Montant", fmt(d.totalTtc, d.currency), true)}
    ${highlightBox("Devis", d.quoteNumber)}
    ${highlightBox("Client", d.clientName)}
    ${ctaButton("Convertir en facture", `${d.appUrl}/devis/${d.quoteId}`)}
    ${para("Vous pouvez maintenant convertir ce devis en facture depuis votre tableau de bord.", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   FACTURE — Invoice sent
════════════════════════════════════════════════════ */
export interface FactureEnvoyeeData extends BaseTemplateData {
  clientName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  subtotalHt: number;
  totalVat: number;
  totalTtc: number;
  currency: string;
  invoiceId: string;
  title?: string | null;
  bankName?: string | null;
  bankIban?: string | null;
  bankBic?: string | null;
}

export function factureEnvoyee(d: FactureEnvoyeeData): string {
  const opts: EmailLayoutOptions = {
    title: `Facture ${d.invoiceNumber} — ${d.companyName}`,
    preheader: `Facture ${d.invoiceNumber} de ${fmt(d.totalTtc, d.currency)} — à régler${d.dueDate ? " avant le " + fmtDate(d.dueDate) : ""}`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    companyPhone: d.companyPhone ?? undefined,
    companyCity: d.companyCity ?? undefined,
    market: d.market,
  };

  const paymentSection = d.market !== "guinee" && d.bankIban
    ? `${divider()}
       <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#94A3B8;">Coordonnées bancaires</p>
       ${infoGrid([
         ...(d.bankName ? [{ label: "Banque", value: d.bankName }] : []),
         { label: "IBAN", value: d.bankIban! },
         ...(d.bankBic ? [{ label: "BIC", value: d.bankBic }] : []),
       ])}`
    : d.market === "guinee"
    ? `${divider()}
       <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#94A3B8;">Modes de paiement</p>
       <p style="font-size:13px;color:#475569;margin:0;">Virement bancaire · Orange Money · MTN Mobile Money · Espèces</p>`
    : "";

  const content = `
    ${heading(`Facture ${d.invoiceNumber}`, `${d.companyName} vous adresse une facture`)}
    ${para(`Bonjour ${d.clientName},`)}
    ${customMessageBlock(d.customMessage, `Veuillez trouver ci-dessous votre facture <strong>${d.invoiceNumber}</strong>${d.title ? ` — ${d.title}` : ""}.`)}
    ${amountBox(fmt(d.subtotalHt, d.currency), fmt(d.totalVat, d.currency), fmt(d.totalTtc, d.currency), d.currency)}
    ${infoGrid([
      { label: "Référence", value: d.invoiceNumber },
      { label: "Date", value: fmtDate(d.invoiceDate) },
      ...(d.dueDate ? [{ label: "Échéance", value: fmtDate(d.dueDate) }] : []),
    ])}
    ${ctaButton("Voir la facture complète", `${d.appUrl}/print/factures/${d.invoiceId}`)}
    ${paymentSection}
    ${d.market === "france" ? alertBox("En cas de retard de paiement, des pénalités seront applicables conformément à l'art. L.441-10 du Code de Commerce.", "info") : ""}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   FACTURE — Payment reminder (3 levels)
════════════════════════════════════════════════════ */
export interface RelancePaiementData extends BaseTemplateData {
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  totalTtc: number;
  remaining: number;
  currency: string;
  invoiceId: string;
  level: 1 | 2 | 3;
  daysLate: number;
}

export function relancePaiement(d: RelancePaiementData): string {
  const config = {
    1: {
      subject: `Rappel de paiement — Facture ${d.invoiceNumber}`,
      preheader: `Votre facture ${d.invoiceNumber} est arrivée à échéance`,
      title: "Rappel de paiement",
      sub: `Facture ${d.invoiceNumber} arrivée à échéance`,
      intro: `Sauf erreur ou omission de notre part, votre facture <strong>${d.invoiceNumber}</strong> est arrivée à échéance le <strong>${fmtDate(d.dueDate)}</strong> et reste impayée.`,
      alertType: "info" as const,
      alertText: "Merci de bien vouloir procéder au règlement dans les meilleurs délais.",
    },
    2: {
      subject: `2ème relance — Facture ${d.invoiceNumber} (${d.daysLate} jours de retard)`,
      preheader: `Facture ${d.invoiceNumber} impayée depuis ${d.daysLate} jours`,
      title: "2ème relance de paiement",
      sub: `Facture ${d.invoiceNumber} — ${d.daysLate} jours de retard`,
      intro: `Malgré notre précédente relance, la facture <strong>${d.invoiceNumber}</strong> échue le <strong>${fmtDate(d.dueDate)}</strong> reste toujours impayée (<strong>${d.daysLate} jours de retard</strong>).`,
      alertType: "warning" as const,
      alertText: "Nous vous demandons de régulariser cette situation sous <strong>48 heures</strong>. À défaut, nous serons dans l'obligation d'engager une procédure de recouvrement.",
    },
    3: {
      subject: `MISE EN DEMEURE — Facture ${d.invoiceNumber}`,
      preheader: `Mise en demeure — Facture ${d.invoiceNumber} impayée depuis ${d.daysLate} jours`,
      title: "Mise en demeure",
      sub: `Facture ${d.invoiceNumber} — ${d.daysLate} jours de retard`,
      intro: `Malgré nos relances successives, la facture <strong>${d.invoiceNumber}</strong> d'un montant de <strong>${fmt(d.remaining, d.currency)}</strong>, échue le <strong>${fmtDate(d.dueDate)}</strong>, reste impayée depuis <strong>${d.daysLate} jours</strong>.`,
      alertType: "danger" as const,
      alertText: `<strong>Par la présente, nous vous mettons en demeure</strong> de régler cette facture sous <strong>5 jours ouvrés</strong>, faute de quoi nous transmettrons ce dossier à notre service contentieux et/ou engagerons une procédure judiciaire.`,
    },
  }[d.level];

  const opts: EmailLayoutOptions = {
    title: config.subject,
    preheader: config.preheader,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    market: d.market,
  };

  const content = `
    ${heading(config.title, config.sub)}
    ${para(`Bonjour ${d.clientName},`)}
    ${para(config.intro)}
    ${highlightBox("Montant restant dû", fmt(d.remaining, d.currency), true)}
    ${infoGrid([
      { label: "Facture", value: d.invoiceNumber },
      { label: "Échéance", value: fmtDate(d.dueDate) },
      { label: "Retard", value: `${d.daysLate} jours` },
    ])}
    ${alertBox(config.alertText, config.alertType)}
    ${ctaButton("Voir la facture", `${d.appUrl}/print/factures/${d.invoiceId}`)}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   PAIEMENT — Confirmation to client
════════════════════════════════════════════════════ */
export interface PaiementReçuData extends BaseTemplateData {
  clientName: string;
  invoiceNumber: string;
  paidAmount: number;
  totalTtc: number;
  remaining: number;
  currency: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  invoiceId: string;
}

const PAY_LABELS: Record<string, string> = {
  virement: "Virement bancaire", cheque: "Chèque",
  especes: "Espèces", carte: "Carte bancaire", autre: "Autre",
};

export function paiementRecu(d: PaiementReçuData): string {
  const opts: EmailLayoutOptions = {
    title: `✅ Paiement reçu — Facture ${d.invoiceNumber}`,
    preheader: `Votre paiement de ${fmt(d.paidAmount, d.currency)} a été enregistré`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    market: d.market,
  };

  const isFullyPaid = d.remaining <= 0;

  const content = `
    ${heading(isFullyPaid ? "Paiement reçu — Merci !" : "Paiement partiel enregistré", `Facture ${d.invoiceNumber}`)}
    ${para(`Bonjour ${d.clientName},`)}
    ${para(isFullyPaid
      ? `Nous avons bien reçu votre paiement pour la facture <strong>${d.invoiceNumber}</strong>. Votre compte est soldé. Merci pour votre confiance.`
      : `Nous avons bien reçu un paiement partiel pour la facture <strong>${d.invoiceNumber}</strong>. Un solde reste dû.`
    )}
    ${highlightBox("Montant reçu", fmt(d.paidAmount, d.currency), true)}
    ${infoGrid([
      { label: "Facture", value: d.invoiceNumber },
      ...(d.paidAt ? [{ label: "Date", value: fmtDate(d.paidAt) }] : []),
      ...(d.paymentMethod ? [{ label: "Mode", value: PAY_LABELS[d.paymentMethod] ?? d.paymentMethod }] : []),
      ...(!isFullyPaid ? [{ label: "Reste dû", value: fmt(d.remaining, d.currency) }] : []),
    ])}
    ${isFullyPaid
      ? ""
      : alertBox(`Il reste <strong>${fmt(d.remaining, d.currency)}</strong> à régler pour solder cette facture.`, "warning")
    }
    ${ctaButton("Télécharger la facture", `${d.appUrl}/print/factures/${d.invoiceId}`)}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   PAIEMENT — Notification to self (admin)
════════════════════════════════════════════════════ */
export function paiementNotifAdmin(d: PaiementReçuData): string {
  const opts: EmailLayoutOptions = {
    title: `💰 Paiement reçu — ${d.invoiceNumber}`,
    preheader: `${d.clientName} a réglé ${fmt(d.paidAmount, d.currency)}`,
    companyName: d.companyName,
  };

  const content = `
    ${heading("Paiement enregistré", `De la part de ${d.clientName}`)}
    ${highlightBox("Montant encaissé", fmt(d.paidAmount, d.currency), true)}
    ${infoGrid([
      { label: "Client", value: d.clientName },
      { label: "Facture", value: d.invoiceNumber },
      ...(d.paidAt ? [{ label: "Date", value: fmtDate(d.paidAt) }] : []),
      ...(d.paymentMethod ? [{ label: "Mode", value: PAY_LABELS[d.paymentMethod] ?? d.paymentMethod }] : []),
      { label: "Statut", value: d.remaining <= 0 ? "✅ Soldée" : `⏳ Reste ${fmt(d.remaining, d.currency)}` },
    ])}
    ${ctaButton("Voir la facture", `${d.appUrl}/factures/${d.invoiceId}`)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   MISSION — Started
════════════════════════════════════════════════════ */
export interface MissionEmailData extends BaseTemplateData {
  clientName: string;
  missionTitle: string;
  missionId: string;
  startDate?: string | null;
  endDate?: string | null;
  tjm?: number | null;
  estimatedDays?: number | null;
  currency: string;
  description?: string | null;
  progressPct?: number;         // for avancement
  progressNote?: string | null; // for avancement
}

export function missionDemarree(d: MissionEmailData): string {
  const opts: EmailLayoutOptions = {
    title: `Mission démarrée — ${d.missionTitle}`,
    preheader: `La mission "${d.missionTitle}" démarre avec ${d.companyName}`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    market: d.market,
  };

  const budget = d.tjm && d.estimatedDays ? d.tjm * d.estimatedDays : null;

  const content = `
    ${heading("Démarrage de mission", d.missionTitle)}
    ${para(`Bonjour ${d.clientName},`)}
    ${customMessageBlock(d.customMessage, `Nous avons le plaisir de vous confirmer le démarrage de la mission <strong>${d.missionTitle}</strong>.`)}
    ${d.description ? para(d.description, true) : ""}
    ${infoGrid([
      ...(d.startDate ? [{ label: "Début", value: fmtDate(d.startDate) }] : []),
      ...(d.endDate ? [{ label: "Fin prévue", value: fmtDate(d.endDate) }] : []),
      ...(d.estimatedDays ? [{ label: "Durée estimée", value: `${d.estimatedDays} jour(s)` }] : []),
      ...(budget ? [{ label: "Budget estimé", value: fmt(budget, d.currency) }] : []),
    ])}
    ${ctaButton("Suivre l'avancement", `${d.appUrl}/missions/${d.missionId}`)}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   MISSION — Progress update
════════════════════════════════════════════════════ */
export function missionAvancement(d: MissionEmailData): string {
  const opts: EmailLayoutOptions = {
    title: `Rapport d'avancement — ${d.missionTitle}`,
    preheader: `Mise à jour de la mission "${d.missionTitle}" — ${d.progressPct ?? 0}%`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    market: d.market,
  };

  const pct = d.progressPct ?? 0;
  const progressBar = `
    <div style="margin:16px 0;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;">Avancement</span>
        <span style="font-size:14px;font-weight:700;color:#2D8A3E;">${pct}%</span>
      </div>
      <div style="height:8px;background:#E2E8F0;border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#2D8A3E,#4DB85C);border-radius:99px;"></div>
      </div>
    </div>
  `;

  const content = `
    ${heading("Rapport d'avancement", d.missionTitle)}
    ${para(`Bonjour ${d.clientName},`)}
    ${customMessageBlock(d.customMessage, `Voici une mise à jour de l'avancement de la mission <strong>${d.missionTitle}</strong>.`)}
    ${progressBar}
    ${d.progressNote ? `<div style="background:#F8FAFC;border-left:3px solid #2D8A3E;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0;"><p style="margin:0;font-size:13px;color:#334155;line-height:1.7;">${d.progressNote}</p></div>` : ""}
    ${infoGrid([
      ...(d.startDate ? [{ label: "Début", value: fmtDate(d.startDate) }] : []),
      ...(d.endDate ? [{ label: "Fin prévue", value: fmtDate(d.endDate) }] : []),
    ])}
    ${ctaButton("Voir les détails", `${d.appUrl}/missions/${d.missionId}`)}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   MISSION — Completed
════════════════════════════════════════════════════ */
export function missionTerminee(d: MissionEmailData): string {
  const opts: EmailLayoutOptions = {
    title: `Mission terminée — ${d.missionTitle}`,
    preheader: `La mission "${d.missionTitle}" est terminée avec succès`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    market: d.market,
  };

  const budget = d.tjm && d.estimatedDays ? d.tjm * d.estimatedDays : null;

  const content = `
    ${heading("Mission accomplie ✓", d.missionTitle)}
    ${para(`Bonjour ${d.clientName},`)}
    ${customMessageBlock(d.customMessage, `Nous avons le plaisir de vous annoncer la clôture de la mission <strong>${d.missionTitle}</strong>. Nous espérons que cette collaboration a répondu à vos attentes.`)}
    ${infoGrid([
      ...(d.startDate ? [{ label: "Début", value: fmtDate(d.startDate) }] : []),
      ...(d.endDate ? [{ label: "Fin", value: fmtDate(d.endDate) }] : []),
      ...(budget ? [{ label: "Montant total", value: fmt(budget, d.currency) }] : []),
    ])}
    ${ctaButton("Voir le récapitulatif", `${d.appUrl}/missions/${d.missionId}`)}
    ${para("Merci pour votre confiance. N'hésitez pas à nous contacter pour tout nouveau projet.", true)}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

/* ═══════════════════════════════════════════════════
   AVOIR / Credit note
════════════════════════════════════════════════════ */
export interface AvoirData extends BaseTemplateData {
  clientName: string;
  avoirNumber: string;
  avoirDate: string;
  invoiceNumber: string;
  totalTtc: number;
  currency: string;
  reason?: string | null;
  invoiceId: string;
}

export function avoirEmis(d: AvoirData): string {
  const opts: EmailLayoutOptions = {
    title: `Avoir ${d.avoirNumber} — ${d.companyName}`,
    preheader: `Un avoir de ${fmt(d.totalTtc, d.currency)} a été émis en votre faveur`,
    companyName: d.companyName,
    companyEmail: d.companyEmail ?? undefined,
    market: d.market,
  };

  const content = `
    ${heading(`Avoir ${d.avoirNumber}`, `Annulation / remboursement de la facture ${d.invoiceNumber}`)}
    ${para(`Bonjour ${d.clientName},`)}
    ${para(`Nous vous adressons cet avoir suite à l'annulation ou la correction de la facture <strong>${d.invoiceNumber}</strong>.`)}
    ${d.reason ? para(d.reason, true) : ""}
    ${highlightBox("Montant de l'avoir", fmt(d.totalTtc, d.currency), true)}
    ${infoGrid([
      { label: "Avoir N°", value: d.avoirNumber },
      { label: "Date", value: fmtDate(d.avoirDate) },
      { label: "Facture d'origine", value: d.invoiceNumber },
    ])}
    ${ctaButton("Voir l'avoir", `${d.appUrl}/print/factures/${d.invoiceId}`)}
    ${para("Cordialement,<br><strong>" + d.companyName + "</strong>", true)}
  `;
  return layout(content, opts);
}

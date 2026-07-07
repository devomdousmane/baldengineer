"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Client, Profile } from "@/types/database";

interface LineItem {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
}

interface DocData {
  number: string;
  title: string;
  date: string;
  dateLabel: string;
  extraDate?: string;
  extraDateLabel?: string;
  status: string;
  currency: string;
  market?: "france" | "guinee";
  subtotal_ht: number;
  total_vat: number;
  total_ttc: number;
  paid_amount?: number;
  payment_method?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  terms?: string | null;
  lines: LineItem[];
}

interface PrintDocumentProps {
  type: "devis" | "facture";
  document: DocData;
  client: Client | null;
  profile: Profile | null;
  /** Masque la barre d'actions Imprimer/Fermer — pour un usage en aperçu intégré (ex. panneau latéral). */
  hideToolbar?: boolean;
}

const BRAND    = "#2D8A3E";
const BRAND_HI = "#4DB85C";
const BRAND_DIM = "#F0FFF4";

/* ── Helpers ── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtAmt(n: number, currency: string) {
  const isGnf = currency === "GNF";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: isGnf ? 0 : 2,
    minimumFractionDigits: isGnf ? 0 : 2,
  }).format(n);
}

/* ── Status config ── */
const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: "Brouillon",  color: "#64748B", bg: "#F1F5F9" },
  sent:      { label: "Envoyé",     color: BRAND,     bg: BRAND_DIM },
  accepted:  { label: "Accepté",    color: "#059669", bg: "#ECFDF5" },
  refused:   { label: "Refusé",     color: "#DC2626", bg: "#FEF2F2" },
  expired:   { label: "Expiré",     color: "#D97706", bg: "#FFFBEB" },
  paid:      { label: "Payée",      color: "#059669", bg: "#ECFDF5" },
  partial:   { label: "Partielle",  color: BRAND,     bg: BRAND_DIM },
  overdue:   { label: "En retard",  color: "#DC2626", bg: "#FEF2F2" },
  cancelled: { label: "Annulée",    color: "#64748B", bg: "#F1F5F9" },
};

const PAY_LABELS: Record<string, string> = {
  virement: "Virement bancaire", cheque: "Chèque",
  especes: "Espèces", carte: "Carte bancaire", autre: "Autre",
};

/* ── Watermarks ── */
const WATERMARKS: Record<string, { text: string; color: string }> = {
  draft:     { text: "BROUILLON", color: "rgba(100,116,139,0.08)" },
  paid:      { text: "PAYÉE",     color: "rgba(5,150,105,0.07)"   },
  cancelled: { text: "ANNULÉE",   color: "rgba(220,38,38,0.08)"   },
  overdue:   { text: "EN RETARD", color: "rgba(220,38,38,0.07)"   },
  refused:   { text: "REFUSÉ",    color: "rgba(220,38,38,0.07)"   },
  accepted:  { text: "ACCEPTÉ",   color: "rgba(5,150,105,0.06)"   },
  expired:   { text: "EXPIRÉ",    color: "rgba(217,119,6,0.07)"   },
};

/* ── TVA breakdown (France) ── */
function groupByVat(lines: LineItem[]) {
  const map = new Map<number, { base: number; vat: number }>();
  for (const l of lines) {
    const ht = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
    const vat = Math.round(ht * l.vat_rate / 100 * 100) / 100;
    const prev = map.get(l.vat_rate) ?? { base: 0, vat: 0 };
    map.set(l.vat_rate, { base: prev.base + ht, vat: prev.vat + vat });
  }
  return [...map.entries()].sort(([a], [b]) => b - a);
}

/* ── Shared CSS ── */
const BASE_CSS = `
@page { size: A4; margin: 14mm 16mm 18mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 10.5px;
  line-height: 1.5;
  color: #0F172A;
  background: white;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
@media screen {
  body { background: #F8FAFC; padding: 32px 24px 64px; }
  .doc-page { max-width: 794px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,.08); position: relative; overflow: hidden; }
  .no-print { display: flex; }
}
@media print {
  body { background: white; padding: 0; }
  .doc-page { box-shadow: none; border-radius: 0; }
  .no-print { display: none !important; }
}
.accent-bar { height: 4px; background: linear-gradient(90deg, ${BRAND}, ${BRAND_HI}); }
.inner { padding: 28px 36px; }
table { width: 100%; border-collapse: collapse; }
th {
  background: #F8FAFC;
  padding: 7px 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #64748B;
  border-bottom: 2px solid #E2E8F0;
  text-align: left;
}
th.r, td.r { text-align: right; }
th.c, td.c { text-align: center; }
td { padding: 8px 10px; font-size: 10.5px; border-bottom: 1px solid #F1F5F9; vertical-align: top; }
tr:last-child td { border-bottom: none; }
tr:nth-child(even) td { background: #FAFAFA; }
.divider { border: none; border-top: 1px solid #E2E8F0; margin: 20px 0; }
.label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: #94A3B8; margin-bottom: 4px; }
.mono { font-family: "JetBrains Mono", "Courier New", monospace; }
.badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 600; letter-spacing: .03em; }
h1 { font-size: 22px; font-weight: 700; letter-spacing: -.02em; }
h2 { font-size: 13px; font-weight: 700; }
.watermark {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-42deg);
  font-size: 96px; font-weight: 900; white-space: nowrap;
  pointer-events: none; z-index: 9999; letter-spacing: 0.2em;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; user-select: none;
}
.trace-box { border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; background: #F8FAFC; display: flex; align-items: flex-start; gap: 14px; }
.trace-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; flex: 1; }
.trace-row { display: flex; flex-direction: column; }
.trace-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; }
.trace-value { font-size: 10px; font-weight: 600; color: #334155; font-family: "JetBrains Mono", monospace; letter-spacing: 0.03em; }
.sign-box { border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; background: #FAFAFA; }
.sign-line { border-top: 1px solid #CBD5E1; margin-top: 40px; width: 100%; }
`;

export function PrintDocument({ type, document: doc, client, profile, hideToolbar = false }: PrintDocumentProps) {
  const [qrUrl, setQrUrl] = useState("");
  const [traceHash, setTraceHash] = useState("");

  const isGuinee = doc.market === "guinee" || doc.currency === "GNF";
  const isFrance = !isGuinee;
  const currency = doc.currency;

  useEffect(() => {
    const qrData = `BALDPRO|${doc.number}|${doc.date}|${doc.total_ttc.toFixed(2)}|${currency}`;

    QRCode.toDataURL(qrData, { width: 88, margin: 1, color: { dark: BRAND, light: "#FFFFFF" } })
      .then(setQrUrl)
      .catch(() => {});

    /* crypto.subtle n'existe que dans un contexte sécurisé (HTTPS ou localhost) —
       sans ce garde, l'accès plante hors de ces contextes (ex. accès via IP réseau en HTTP). */
    if (typeof crypto === "undefined" || !crypto.subtle) return;

    crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(
        qrData + (client?.name ?? "") + (profile?.vat_number ?? "") + (profile?.company_nif ?? "")
      ))
      .then((buf) => {
        const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
        setTraceHash(`${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}`);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const status = STATUS_LABELS[doc.status] ?? { label: doc.status, color: "#64748B", bg: "#F1F5F9" };
  const watermark = WATERMARKS[doc.status];
  const companyName = profile?.company_name || "BaldEngineer";
  const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const hasDiscount = doc.lines.some((l) => l.discount_pct > 0);
  const allZeroVat = doc.lines.every((l) => l.vat_rate === 0);
  const remaining = doc.total_ttc - (doc.paid_amount ?? 0);
  const vatGroups = isFrance ? groupByVat(doc.lines) : [];

  /* Guinea: some businesses apply 18% TVA, others are exempt */
  const gnHasTva = isGuinee && !allZeroVat;

  /* Doc type label */
  const docTypeLabel = type === "devis"
    ? (isGuinee ? "DEVIS / PROFORMA" : "DEVIS")
    : (isGuinee ? "FACTURE" : "FACTURE");

  return (
    <>
      <style>{BASE_CSS}</style>

      {/* Watermark */}
      {watermark && (
        <div className="watermark" style={{ color: watermark.color }}>{watermark.text}</div>
      )}

      {/* Screen toolbar */}
      {!hideToolbar && (
        <div className="no-print" style={{ maxWidth: 794, margin: "0 auto 16px", gap: 8, alignItems: "center" }}>
          <button onClick={() => window.print()}
            style={{ background: BRAND, color: "white", border: "none", borderRadius: 7, padding: "9px 20px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
            Imprimer / Sauvegarder en PDF
          </button>
          <button onClick={() => window.close()}
            style={{ background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 7, padding: "9px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
            Fermer
          </button>
          {!qrUrl && <span style={{ fontSize: 12, color: "#94A3B8" }}>Génération du QR code…</span>}
        </div>
      )}

      <div className="doc-page">
        <div className="accent-bar" />

        <div className="inner">

          {/* ══ HEADER ══════════════════════════════════════════════ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>

            {/* Left: company info */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, maxWidth: "52%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isGuinee ? "/logo-guinee.png" : "/logo.png"}
                alt="Logo"
                style={{ width: isGuinee ? 127 : 82, height: 48, objectFit: "contain", flexShrink: 0 }}
              />
              <div>
                {companyName && <h2 style={{ marginBottom: 3 }}>{companyName}</h2>}
                {profile?.company_address && <p style={{ color: "#475569", fontSize: 10 }}>{profile.company_address}</p>}
                {(profile?.company_zip || profile?.company_city) && (
                  <p style={{ color: "#475569", fontSize: 10 }}>
                    {isGuinee && "B.P. "}{[profile?.company_zip, profile?.company_city].filter(Boolean).join(" ")}
                  </p>
                )}
                <p style={{ color: "#475569", fontSize: 10 }}>{isGuinee ? "Guinée" : "France"}</p>
                {profile?.company_phone && <p style={{ color: "#94A3B8", fontSize: 10, marginTop: 3 }}>{profile.company_phone}</p>}
                {profile?.company_email && <p style={{ color: "#94A3B8", fontSize: 10 }}>{profile.company_email}</p>}
                {profile?.company_website && <p style={{ color: "#94A3B8", fontSize: 10 }}>{profile.company_website}</p>}
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {isFrance && profile?.company_siren && (
                    <span style={{ fontSize: 10, background: "#F1F5F9", color: "#475569", padding: "1px 6px", borderRadius: 4 }}>SIREN {profile.company_siren}</span>
                  )}
                  {isFrance && profile?.vat_number && (
                    <span style={{ fontSize: 10, background: "#F1F5F9", color: "#475569", padding: "1px 6px", borderRadius: 4 }}>TVA {profile.vat_number}</span>
                  )}
                  {isGuinee && profile?.company_nif && (
                    <span style={{ fontSize: 10, background: "#F0FFF4", color: BRAND, padding: "1px 6px", borderRadius: 4 }}>NIF {profile.company_nif}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: doc identity */}
            <div style={{ textAlign: "right" }}>
              <h1 style={{ color: BRAND }}>{docTypeLabel}</h1>
              <p className="mono" style={{ color: BRAND, marginTop: 4, fontWeight: 700, fontSize: 13, letterSpacing: "0.02em" }}>{doc.number}</p>
              {doc.title && <p style={{ color: "#475569", marginTop: 4, fontSize: 11, fontStyle: "italic", maxWidth: 220 }}>{doc.title}</p>}
              <div style={{ marginTop: 8 }}>
                <span className="badge" style={{ backgroundColor: status.bg, color: status.color }}>{status.label}</span>
              </div>
              {isFrance && type === "facture" && (
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1D4ED8", padding: "1px 7px", borderRadius: 4, fontWeight: 600 }}>
                    Factur-X EN 16931
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="divider" />

          {/* ══ CLIENT + DATES ══════════════════════════════════════ */}
          <div style={{ display: "flex", gap: 28, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <p className="label">{type === "devis" ? "Destinataire du devis" : "Facturé à"}</p>
              {client ? (
                <div style={{ background: "#FAFAFA", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 14px" }}>
                  <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{client.name}</p>
                  {client.address && <p style={{ color: "#475569", fontSize: 10 }}>{client.address}</p>}
                  {(client.zip || client.city) && (
                    <p style={{ color: "#475569", fontSize: 10 }}>
                      {isGuinee && client.zip ? "B.P. " : ""}{[client.zip, client.city].filter(Boolean).join(" ")}
                    </p>
                  )}
                  {client.country && <p style={{ color: "#475569", fontSize: 10 }}>{client.country}</p>}
                  {client.phone && <p style={{ color: "#94A3B8", fontSize: 10, marginTop: 4 }}>{client.phone}</p>}
                  {client.email && <p style={{ color: "#94A3B8", fontSize: 10 }}>{client.email}</p>}
                  <div style={{ marginTop: 5, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {isFrance && client.siren && (
                      <span style={{ fontSize: 10, background: "#F1F5F9", color: "#475569", padding: "1px 6px", borderRadius: 4 }}>SIREN {client.siren}</span>
                    )}
                    {isFrance && client.vat_number && (
                      <span style={{ fontSize: 10, background: "#F1F5F9", color: "#475569", padding: "1px 6px", borderRadius: 4 }}>TVA {client.vat_number}</span>
                    )}
                    {isGuinee && client.nif && (
                      <span style={{ fontSize: 10, background: "#F0FFF4", color: BRAND, padding: "1px 6px", borderRadius: 4 }}>NIF {client.nif}</span>
                    )}
                  </div>
                </div>
              ) : <p style={{ color: "#94A3B8" }}>—</p>}
            </div>

            <div style={{ flexShrink: 0, minWidth: 170 }}>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 14px", display: "grid", gap: 10 }}>
                <div>
                  <p className="label">{doc.dateLabel}</p>
                  <p style={{ fontWeight: 600, fontSize: 11 }}>{fmtDate(doc.date)}</p>
                </div>
                {doc.extraDate && (
                  <div>
                    <p className="label">{doc.extraDateLabel}</p>
                    <p style={{ fontWeight: 600, fontSize: 11 }}>{fmtDate(doc.extraDate)}</p>
                  </div>
                )}
                {isFrance && type === "facture" && (
                  <div>
                    <p className="label">Délai de paiement</p>
                    <p style={{ fontWeight: 600, fontSize: 11, color: BRAND }}>30 jours net</p>
                  </div>
                )}
                {isGuinee && (
                  <div>
                    <p className="label">Devise</p>
                    <p style={{ fontWeight: 600, fontSize: 11, fontFamily: "monospace" }}>{currency}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ LINES TABLE ════════════════════════════════════════ */}
          <table>
            <thead>
              <tr>
                <th style={{ width: 24 }}>#</th>
                <th>Désignation</th>
                <th className="c" style={{ width: 52 }}>Qté</th>
                <th className="c" style={{ width: 46 }}>Unité</th>
                <th className="r" style={{ width: 96 }}>Prix unit. HT</th>
                {hasDiscount && <th className="r" style={{ width: 56 }}>Remise</th>}
                <th className="r" style={{ width: 96 }}>Montant HT</th>
                {(!allZeroVat) && <th className="r" style={{ width: 48 }}>TVA</th>}
                {isGuinee && !allZeroVat && <th className="r" style={{ width: 96 }}>Montant TTC</th>}
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((l) => {
                const ht  = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
                const ttc = Math.round(ht * (1 + l.vat_rate / 100) * 100) / 100;
                return (
                  <tr key={l.position}>
                    <td style={{ color: "#94A3B8", fontSize: 10 }}>{l.position}</td>
                    <td>{l.description}</td>
                    <td className="c" style={{ color: "#475569" }}>{l.quantity}</td>
                    <td className="c" style={{ color: "#475569" }}>{l.unit}</td>
                    <td className="r mono">{fmtAmt(l.unit_price, currency)}</td>
                    {hasDiscount && (
                      <td className="r" style={{ color: "#D97706" }}>
                        {l.discount_pct > 0 ? `-${l.discount_pct}%` : "—"}
                      </td>
                    )}
                    <td className="r mono" style={{ fontWeight: 600 }}>{fmtAmt(ht, currency)}</td>
                    {(!allZeroVat) && <td className="r" style={{ color: "#64748B" }}>{l.vat_rate}%</td>}
                    {isGuinee && !allZeroVat && (
                      <td className="r mono" style={{ fontWeight: 600, color: BRAND }}>{fmtAmt(ttc, currency)}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ══ TOTALS ════════════════════════════════════════════ */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <div style={{ width: 300 }}>

              {/* France: TVA breakdown by rate */}
              {isFrance && vatGroups.length > 1 && (
                <div style={{ marginBottom: 8, border: "1px solid #E2E8F0", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ background: "#F8FAFC", padding: "5px 12px", borderBottom: "1px solid #E2E8F0" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em" }}>Détail TVA</span>
                  </div>
                  {vatGroups.map(([rate, { base, vat }]) => (
                    <div key={rate} style={{ display: "flex", justifyContent: "space-between", padding: "5px 12px", borderBottom: "1px solid #F1F5F9", fontSize: 10 }}>
                      <span style={{ color: "#64748B" }}>Base {rate}% : <span className="mono">{fmtAmt(base, currency)}</span></span>
                      <span className="mono" style={{ fontWeight: 600 }}>TVA {fmtAmt(vat, currency)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals box */}
              <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #F1F5F9" }}>
                  <span style={{ color: "#64748B" }}>Sous-total HT</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{fmtAmt(doc.subtotal_ht, currency)}</span>
                </div>
                {!allZeroVat ? (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ color: "#64748B" }}>
                      {isGuinee ? "TVA (18%)" : "TVA"}
                    </span>
                    <span className="mono" style={{ fontWeight: 600 }}>{fmtAmt(doc.total_vat, currency)}</span>
                  </div>
                ) : (
                  isGuinee && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #F1F5F9" }}>
                      <span style={{ color: "#64748B", fontSize: 10 }}>TVA</span>
                      <span style={{ color: "#94A3B8", fontSize: 10 }}>Exonéré</span>
                    </div>
                  )
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: BRAND_DIM, fontWeight: 700, fontSize: 13, color: BRAND }}>
                  <span>Total {allZeroVat ? "" : "TTC"}</span>
                  <span className="mono">{fmtAmt(doc.total_ttc, currency)}</span>
                </div>
                {doc.paid_amount !== undefined && doc.paid_amount > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 14px", borderTop: "1px dashed #E2E8F0", color: "#059669", fontSize: 10 }}>
                      <span>Encaissé{doc.payment_method ? ` · ${PAY_LABELS[doc.payment_method] ?? doc.payment_method}` : ""}</span>
                      <span className="mono" style={{ fontWeight: 600 }}>-{fmtAmt(doc.paid_amount, currency)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", fontWeight: 700, fontSize: 12, color: remaining > 0 ? "#DC2626" : "#059669", borderTop: "1px solid #F1F5F9" }}>
                      <span>Reste à payer</span>
                      <span className="mono">{fmtAmt(remaining, currency)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ══ PAYMENT INFO ══════════════════════════════════════ */}
          {type === "facture" && (
            <>
              <hr className="divider" />
              {isFrance && profile?.bank_iban ? (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "12px 16px" }}>
                  <p className="label" style={{ marginBottom: 6 }}>Coordonnées bancaires — Règlement par virement SEPA</p>
                  <div style={{ display: "grid", gap: 3 }}>
                    {profile.bank_name && <p style={{ fontWeight: 600, fontSize: 11 }}>{profile.bank_name}</p>}
                    <p className="mono" style={{ color: BRAND, letterSpacing: "0.05em", fontSize: 11 }}>{profile.bank_iban}</p>
                    {profile.bank_bic && <p className="mono" style={{ color: "#475569", fontSize: 10 }}>BIC : {profile.bank_bic}</p>}
                  </div>
                </div>
              ) : isGuinee && profile?.bank_iban ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Bank */}
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "12px 14px" }}>
                    <p className="label" style={{ marginBottom: 6 }}>Versement bancaire</p>
                    {profile.bank_name && <p style={{ fontWeight: 600, fontSize: 11 }}>{profile.bank_name}</p>}
                    <p className="mono" style={{ color: BRAND, fontSize: 10, marginTop: 3 }}>{profile.bank_iban}</p>
                    {profile.bank_bic && <p className="mono" style={{ color: "#475569", fontSize: 10 }}>BIC : {profile.bank_bic}</p>}
                  </div>
                  {/* Mobile money */}
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "12px 14px" }}>
                    <p className="label" style={{ marginBottom: 6 }}>Mobile Money</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>🟠</span>
                        <div>
                          <p style={{ fontSize: 10, color: "#94A3B8" }}>Orange Money</p>
                          <p style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>—</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>🟡</span>
                        <div>
                          <p style={{ fontSize: 10, color: "#94A3B8" }}>MTN Mobile Money</p>
                          <p style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>—</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isGuinee && !profile?.bank_iban ? (
                /* Guinea — no bank configured: show mobile money only */
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "12px 16px" }}>
                  <p className="label" style={{ marginBottom: 6 }}>Modes de paiement acceptés</p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {[{ e: "🟠", n: "Orange Money" }, { e: "🟡", n: "MTN Mobile Money" }, { e: "💵", n: "Espèces" }, { e: "🏦", n: "Virement bancaire" }].map(({ e, n }) => (
                      <div key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 13 }}>{e}</span>
                        <span style={{ fontSize: 10, color: "#475569" }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}

          {/* ══ NOTES + TERMS ═════════════════════════════════════ */}
          {(doc.notes || doc.terms) && (
            <>
              <hr className="divider" />
              <div style={{ display: "flex", gap: 32 }}>
                {doc.notes && (
                  <div style={{ flex: 1 }}>
                    <p className="label">Observations</p>
                    <p style={{ color: "#475569", whiteSpace: "pre-wrap", fontSize: 10 }}>{doc.notes}</p>
                  </div>
                )}
                {doc.terms && (
                  <div style={{ flex: 1 }}>
                    <p className="label">Conditions</p>
                    <p style={{ color: "#475569", whiteSpace: "pre-wrap", fontSize: 10 }}>{doc.terms}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ BON POUR ACCORD (Guinea quotes) ══════════════════ */}
          {type === "devis" && (
            <>
              <hr className="divider" />
              {isGuinee ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 }}>
                  {/* Emetteur */}
                  <div className="sign-box">
                    <p className="label" style={{ marginBottom: 8 }}>Émetteur · {companyName || "Prestataire"}</p>
                    <p style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>Fait à {profile?.company_city || "___________"}, le {fmtDate(doc.date)}</p>
                    <p style={{ fontSize: 10, color: "#64748B" }}>Cachet et signature :</p>
                    <div className="sign-line" />
                  </div>
                  {/* Client */}
                  <div className="sign-box">
                    <p className="label" style={{ marginBottom: 8 }}>
                      BON POUR ACCORD · {client?.name || "Client"}
                    </p>
                    <p style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>Lu et approuvé, le ________________</p>
                    <p style={{ fontSize: 10, color: "#64748B" }}>Cachet et signature du client :</p>
                    <div className="sign-line" />
                  </div>
                </div>
              ) : (
                /* France: simple acceptance mention */
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p className="label" style={{ marginBottom: 4 }}>Validité & acceptation</p>
                    <p style={{ fontSize: 10, color: "#475569" }}>
                      Ce devis est valable jusqu&apos;au <strong>{doc.extraDate ? fmtDate(doc.extraDate) : "—"}</strong>.
                      Pour l&apos;accepter, veuillez le retourner signé avec la mention &quot;Bon pour accord&quot;.
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, borderLeft: "1px solid #E2E8F0", paddingLeft: 12 }}>
                    <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 24 }}>Signature :</p>
                    <div style={{ borderTop: "1px solid #CBD5E1", width: 100 }} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══ LEGAL ═════════════════════════════════════════════ */}
          {isFrance && (
            <>
              <hr className="divider" />
              <p style={{ color: "#94A3B8", fontSize: 10, lineHeight: 1.6 }}>
                {profile?.legal_mention ||
                  (type === "facture"
                    ? "Tout retard de paiement entraîne des pénalités de retard égales à 3 fois le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (L.441-10 C.Com.)."
                    : "En l'absence de paiement à l'échéance, des pénalités de retard seront appliquées conformément aux dispositions légales en vigueur.")}
              </p>
            </>
          )}

          {isGuinee && profile?.legal_mention && (
            <>
              <hr className="divider" />
              <p style={{ color: "#94A3B8", fontSize: 10, lineHeight: 1.6 }}>{profile.legal_mention}</p>
            </>
          )}

          {/* ══ TRAÇABILITÉ ═══════════════════════════════════════ */}
          <hr className="divider" style={{ marginTop: 20 }} />
          <div className="trace-box">
            {qrUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR traçabilité" width={64} height={64} style={{ flexShrink: 0, borderRadius: 4 }} />
            )}
            <div className="trace-grid">
              <div className="trace-row">
                <span className="trace-label">Référence</span>
                <span className="trace-value">{doc.number}</span>
              </div>
              <div className="trace-row">
                <span className="trace-label">Empreinte numérique</span>
                <span className="trace-value" style={{ fontSize: 10 }}>{traceHash || "—"}</span>
              </div>
              <div className="trace-row">
                <span className="trace-label">Émis le</span>
                <span className="trace-value">{fmtDate(doc.date)}</span>
              </div>
              <div className="trace-row">
                <span className="trace-label">Généré le</span>
                <span className="trace-value">{now}</span>
              </div>
              <div className="trace-row" style={{ gridColumn: "1 / -1" }}>
                <span className="trace-label">Montant · Devise</span>
                <span className="trace-value">{fmtAmt(doc.total_ttc, currency)} · {currency}</span>
              </div>
            </div>
          </div>

          {/* ══ FOOTER ════════════════════════════════════════════ */}
          <hr className="divider" style={{ marginTop: 14 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94A3B8", fontSize: 10 }}>
            <span>{companyName}</span>
            <span className="mono" style={{ color: "#CBD5E1", fontSize: 10 }}>● ● ●</span>
            <span>{doc.number} · {new Date(doc.date).toLocaleDateString("fr-FR")} · BaldPro</span>
          </div>
        </div>
      </div>
    </>
  );
}

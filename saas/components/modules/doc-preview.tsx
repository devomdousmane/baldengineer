"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Market } from "@/types/database";

export interface PreviewLine {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  discount_pct: number;
}

export interface PreviewProfile {
  company_name?: string | null;
  full_name?: string | null;
  company_address?: string | null;
  company_city?: string | null;
  company_zip?: string | null;
  company_siren?: string | null;
  company_nif?: string | null;
  vat_number?: string | null;
  company_email?: string | null;
  bank_iban?: string | null;
  bank_bic?: string | null;
  bank_name?: string | null;
}

export interface PreviewClient {
  name: string;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  siren?: string | null;
  nif?: string | null;
  vat_number?: string | null;
  email?: string | null;
}

interface DocPreviewProps {
  type: "devis" | "facture";
  title: string;
  date: string;
  extraDate?: string;
  extraDateLabel?: string;
  market: Market;
  currency: string;
  lines: PreviewLine[];
  notes?: string;
  terms?: string;
  client?: PreviewClient | null;
  profile?: PreviewProfile | null;
}

function calcTotals(lines: PreviewLine[]) {
  let ht = 0, vat = 0;
  for (const l of lines) {
    const lineHt = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
    vat += Math.round(lineHt * l.vat_rate / 100 * 100) / 100;
    ht += lineHt;
  }
  return { ht: Math.round(ht * 100) / 100, vat: Math.round(vat * 100) / 100, ttc: Math.round((ht + vat) * 100) / 100 };
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const accent = "#0369A1";
const accentLight = "#EFF6FF";
const muted = "#64748B";
const border = "#E2E8F0";
const text = "#0F172A";

export function DocPreview({ type, title, date, extraDate, extraDateLabel, market, currency, lines, notes, terms, client, profile }: DocPreviewProps) {
  const totals = calcTotals(lines);
  const hasContent = lines.some((l) => l.description || l.unit_price > 0);
  const companyName = profile?.company_name || profile?.full_name || "Votre entreprise";
  const hasDiscount = lines.some((l) => l.discount_pct > 0);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        border: `1px solid ${border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,.07)",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
        color: text,
        lineHeight: 1.45,
      }}
    >
      {/* Accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, #0EA5E9)` }} />

      {/* Document header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          {/* Logo + company */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" style={{ width: 56, height: 33, objectFit: "contain" }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 12, color: text, margin: 0 }}>{companyName}</p>
              {profile?.company_address && <p style={{ color: muted, margin: "1px 0 0", fontSize: 10 }}>{profile.company_address}</p>}
              {(profile?.company_zip || profile?.company_city) && (
                <p style={{ color: muted, margin: 0, fontSize: 10 }}>{[profile?.company_zip, profile?.company_city].filter(Boolean).join(" ")}</p>
              )}
              {profile?.vat_number && <p style={{ color: muted, margin: "2px 0 0", fontSize: 9 }}>TVA : {profile.vat_number}</p>}
            </div>
          </div>
          {/* Doc type */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span
              style={{
                display: "inline-block", backgroundColor: accentLight, color: accent,
                fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
                padding: "3px 10px", borderRadius: 4, textTransform: "uppercase",
              }}
            >
              {type === "devis" ? "Devis" : "Facture"}
            </span>
            <p style={{ color: muted, margin: "6px 0 0", fontSize: 10 }}>{fmtDate(date)}</p>
            {extraDate && <p style={{ color: muted, margin: "2px 0 0", fontSize: 10 }}>{extraDateLabel ?? ""} {fmtDate(extraDate)}</p>}
          </div>
        </div>
      </div>

      {/* Client + title */}
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${border}`, display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: muted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Destinataire</p>
          <AnimatePresence mode="wait">
            {client ? (
              <motion.div key={client.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <p style={{ fontWeight: 600, fontSize: 11, margin: 0 }}>{client.name}</p>
                {client.address && <p style={{ color: muted, margin: "1px 0 0", fontSize: 10 }}>{client.address}</p>}
                {(client.zip || client.city) && (
                  <p style={{ color: muted, margin: 0, fontSize: 10 }}>{[client.zip, client.city].filter(Boolean).join(" ")}</p>
                )}
                {client.siren && <p style={{ color: muted, margin: "2px 0 0", fontSize: 9 }}>SIREN : {client.siren}</p>}
                {client.nif && <p style={{ color: muted, margin: "2px 0 0", fontSize: 9 }}>NIF : {client.nif}</p>}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ width: 100, height: 10, background: "#F1F5F9", borderRadius: 3, margin: "2px 0" }} />
                <div style={{ width: 70, height: 9, background: "#F1F5F9", borderRadius: 3, margin: "3px 0" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ flexShrink: 0, minWidth: 120 }}>
          <AnimatePresence mode="wait">
            {title ? (
              <motion.p
                key={title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ fontWeight: 500, fontSize: 10, color: text, fontStyle: "italic" }}
              >
                {title}
              </motion.p>
            ) : (
              <div style={{ width: "100%", height: 9, background: "#F1F5F9", borderRadius: 3 }} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lines table */}
      <div style={{ padding: "0 20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 0", fontSize: 9, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}`, fontWeight: 600 }}>
                Description
              </th>
              <th style={{ textAlign: "center", padding: "6px 4px", fontSize: 9, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}`, fontWeight: 600, width: 28 }}>
                Qté
              </th>
              <th style={{ textAlign: "right", padding: "6px 0", fontSize: 9, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}`, fontWeight: 600, width: 70 }}>
                PU HT
              </th>
              {hasDiscount && (
                <th style={{ textAlign: "right", padding: "6px 0", fontSize: 9, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}`, fontWeight: 600, width: 40 }}>
                  Rem.
                </th>
              )}
              <th style={{ textAlign: "right", padding: "6px 0", fontSize: 9, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}`, fontWeight: 600, width: 70 }}>
                Total HT
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const ht = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
              const isEmpty = !l.description && l.unit_price === 0;
              return (
                <tr key={l.id} style={{ backgroundColor: i % 2 === 1 ? "#FAFAFA" : "transparent" }}>
                  <td style={{ padding: "5px 0", fontSize: 10, borderBottom: i < lines.length - 1 ? `1px solid ${border}` : "none", verticalAlign: "top" }}>
                    {isEmpty
                      ? <div style={{ width: "60%", height: 8, background: "#F1F5F9", borderRadius: 2, marginTop: 2 }} />
                      : l.description || <span style={{ color: "#CBD5E1" }}>—</span>
                    }
                    {l.unit && !isEmpty && <span style={{ color: muted, fontSize: 9, marginLeft: 4 }}>({l.unit})</span>}
                  </td>
                  <td style={{ padding: "5px 4px", textAlign: "center", fontSize: 10, color: muted, borderBottom: i < lines.length - 1 ? `1px solid ${border}` : "none" }}>
                    {isEmpty ? "—" : l.quantity}
                  </td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontSize: 10, fontFamily: "monospace", borderBottom: i < lines.length - 1 ? `1px solid ${border}` : "none" }}>
                    {isEmpty ? "—" : fmt(l.unit_price, currency)}
                  </td>
                  {hasDiscount && (
                    <td style={{ padding: "5px 0", textAlign: "right", fontSize: 10, color: "#D97706", borderBottom: i < lines.length - 1 ? `1px solid ${border}` : "none" }}>
                      {l.discount_pct > 0 ? `-${l.discount_pct}%` : "—"}
                    </td>
                  )}
                  <td style={{ padding: "5px 0", textAlign: "right", fontSize: 10, fontFamily: "monospace", fontWeight: 600, borderBottom: i < lines.length - 1 ? `1px solid ${border}` : "none" }}>
                    {isEmpty ? "—" : fmt(ht, currency)}
                  </td>
                </tr>
              );
            })}
            {lines.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "16px 0", textAlign: "center", color: "#CBD5E1", fontSize: 10 }}>
                  Aucune prestation
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ padding: "10px 20px 14px", borderTop: `1px solid ${border}`, marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10, color: muted }}>
              <span>Total HT</span>
              <motion.span key={totals.ht} animate={{ opacity: [0.4, 1] }} transition={{ duration: 0.15 }} style={{ fontFamily: "monospace" }}>
                {fmt(totals.ht, currency)}
              </motion.span>
            </div>
            {market === "france" && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10, color: muted }}>
                <span>TVA</span>
                <motion.span key={totals.vat} animate={{ opacity: [0.4, 1] }} transition={{ duration: 0.15 }} style={{ fontFamily: "monospace" }}>
                  {fmt(totals.vat, currency)}
                </motion.span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, fontWeight: 700, color: accent, borderTop: `1px solid ${border}`, marginTop: 3 }}>
              <span>Total TTC</span>
              <motion.span key={totals.ttc} animate={{ opacity: [0.4, 1], scale: [0.97, 1] }} transition={{ duration: 0.18 }} style={{ fontFamily: "monospace" }}>
                {fmt(totals.ttc, currency)}
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes preview */}
      {(notes || terms) && (
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${border}`, backgroundColor: "#FAFAFA", display: "flex", gap: 16 }}>
          {notes && (
            <div style={{ flex: 1 }}>
              <p style={{ color: muted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Notes</p>
              <p style={{ color: "#475569", fontSize: 10, margin: 0, whiteSpace: "pre-wrap" }}>{notes}</p>
            </div>
          )}
          {terms && (
            <div style={{ flex: 1 }}>
              <p style={{ color: muted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Conditions</p>
              <p style={{ color: "#475569", fontSize: 10, margin: 0, whiteSpace: "pre-wrap" }}>{terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "8px 20px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", color: "#94A3B8", fontSize: 9 }}>
        <span>{companyName}</span>
        <span>BaldPro</span>
      </div>
    </div>
  );
}

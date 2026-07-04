"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { createClientAction, updateClientAction } from "@/lib/actions/clients";
import { ArrowLeft, Building2, User, MapPin, Phone, Mail, Hash, FileText, Globe } from "lucide-react";
import Link from "next/link";
import type { Client, Market } from "@/types/database";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const card = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, delay: i * 0.07, ease } },
});

/* ── Live client card preview ── */
function ClientPreview({ form }: { form: {
  name: string; type: string; market: string; email: string; phone: string;
  address: string; city: string; zip: string; country: string;
  siren: string; nif: string; vat_number: string; notes: string;
} }) {
  const isCompany = form.type === "company";
  const isFrance = form.market === "france";
  const displayName = form.name || "Nom du client";
  const hasAddress = form.address || form.city || form.zip;
  const hasFiscal = (isFrance && (form.siren || form.vat_number)) || (!isFrance && form.nif);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Card preview */}
      <div style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}>
        {/* Accent bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #2D8A3E, #4DB85C)" }} />

        <div style={{ padding: "16px 18px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 10,
              background: "rgba(45,138,62,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {isCompany
                ? <Building2 size={18} color="#2D8A3E" />
                : <User size={18} color="#2D8A3E" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </p>
              <div style={{ display: "flex", gap: 5 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "1px 7px", borderRadius: 999,
                  fontSize: 9, fontWeight: 600,
                  background: isCompany ? "#F0FFF4" : "#F8FAFC",
                  color: isCompany ? "#2D8A3E" : "#475569",
                }}>
                  {isCompany ? "Entreprise" : "Particulier"}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "1px 7px", borderRadius: 999,
                  fontSize: 9, fontWeight: 600,
                  background: isFrance ? "rgba(29,78,216,0.08)" : "rgba(220,38,38,0.08)",
                  color: isFrance ? "#1D4ED8" : "#DC2626",
                }}>
                  {isFrance ? "🇫🇷 France" : "🇬🇳 Guinée"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          {(form.email || form.phone) && (
            <div style={{ display: "grid", gap: 5, marginBottom: 10 }}>
              {form.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Mail size={11} color="#94A3B8" />
                  <span style={{ fontSize: 11, color: "#475569" }}>{form.email}</span>
                </div>
              )}
              {form.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Phone size={11} color="#94A3B8" />
                  <span style={{ fontSize: 11, color: "#475569" }}>{form.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Address */}
          {hasAddress && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 10 }}>
              <MapPin size={11} color="#94A3B8" style={{ marginTop: 2 }} />
              <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
                {form.address && <div>{form.address}</div>}
                {(form.zip || form.city) && <div>{[form.zip, form.city].filter(Boolean).join(" ")}</div>}
                {form.country && form.country !== "France" && <div>{form.country}</div>}
              </div>
            </div>
          )}

          {/* Fiscal IDs */}
          {isCompany && hasFiscal && (
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "8px 10px", display: "grid", gap: 4 }}>
              {isFrance && form.siren && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Hash size={10} color="#94A3B8" />
                  <span style={{ fontSize: 10, color: "#475569" }}>SIREN : <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>{form.siren}</span></span>
                </div>
              )}
              {isFrance && form.vat_number && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Globe size={10} color="#94A3B8" />
                  <span style={{ fontSize: 10, color: "#475569" }}>TVA : <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>{form.vat_number}</span></span>
                </div>
              )}
              {!isFrance && form.nif && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Hash size={10} color="#94A3B8" />
                  <span style={{ fontSize: 10, color: "#475569" }}>NIF : <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>{form.nif}</span></span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {form.notes && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "flex-start", gap: 7 }}>
              <FileText size={11} color="#94A3B8" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic", lineHeight: 1.5 }}>
                {form.notes.slice(0, 80)}{form.notes.length > 80 ? "…" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 10, textAlign: "center" }}>
        Aperçu — mise à jour en temps réel
      </p>
    </div>
  );
}

interface Props {
  /** Client existant → mode édition. Absent → mode création. */
  client?: Client;
}

export function ClientForm({ client }: Props) {
  const router = useRouter();
  const isEdit = !!client;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: client?.name ?? "",
    type: (client?.type ?? "company") as "company" | "individual",
    market: (client?.market ?? "france") as Market,
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    address: client?.address ?? "",
    city: client?.city ?? "",
    zip: client?.zip ?? "",
    country: client?.country ?? "France",
    siren: client?.siren ?? "",
    nif: client?.nif ?? "",
    vat_number: client?.vat_number ?? "",
    notes: client?.notes ?? "",
  });

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          name: form.name, type: form.type, market: form.market,
          email: form.email || null, phone: form.phone || null,
          address: form.address || null, city: form.city || null,
          zip: form.zip || null, country: form.country || "France",
          siren: form.market === "france" ? (form.siren || null) : null,
          nif: form.market === "guinee" ? (form.nif || null) : null,
          vat_number: form.market === "france" ? (form.vat_number || null) : null,
          notes: form.notes || null,
        };
        if (isEdit) {
          await updateClientAction(client.id, payload);
          router.push(`/clients`);
        } else {
          await createClientAction(payload);
          router.push("/clients");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Erreur lors de la ${isEdit ? "modification" : "création"}`);
      }
    });
  };

  return (
    <>
      <Header
        title={isEdit ? `Modifier ${client.name}` : "Nouveau client"}
        subtitle={isEdit ? "Mettez à jour les informations du client" : "Ajoutez un client à votre portefeuille"}
        actions={
          <Link href="/clients">
            <Button variant="ghost" size="sm" iconLeft={<ArrowLeft className="w-3.5 h-3.5" />}>
              Retour
            </Button>
          </Link>
        }
      />

      <PageWrapper>
        {/* Two-column layout: form left, preview right */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Left: Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Type + Marché */}
            <motion.div {...card(0)}>
              <Card padding="lg">
                <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Profil client</h2>
                {/* Toggle type */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-[var(--color-text-2)] mb-2">Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["company", "individual"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, type: t }))}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border text-sm font-medium transition-all"
                        style={{
                          background: form.type === t ? "var(--color-accent-dim)" : "var(--color-bg-2)",
                          borderColor: form.type === t ? "var(--color-accent)" : "var(--color-border)",
                          color: form.type === t ? "var(--color-accent)" : "var(--color-text-2)",
                        }}
                      >
                        {t === "company"
                          ? <Building2 className="w-3.5 h-3.5 shrink-0" />
                          : <User className="w-3.5 h-3.5 shrink-0" />}
                        {t === "company" ? "Entreprise" : "Particulier"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marché */}
                <div className="grid grid-cols-2 gap-2">
                  {(["france", "guinee"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, market: m }))}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border text-sm font-medium transition-all"
                      style={{
                        background: form.market === m ? (m === "france" ? "rgba(29,78,216,0.07)" : "rgba(220,38,38,0.07)") : "var(--color-bg-2)",
                        borderColor: form.market === m ? (m === "france" ? "#1D4ED8" : "#DC2626") : "var(--color-border)",
                        color: form.market === m ? (m === "france" ? "#1D4ED8" : "#DC2626") : "var(--color-text-2)",
                      }}
                    >
                      <span>{m === "france" ? "🇫🇷" : "🇬🇳"}</span>
                      {m === "france" ? "France" : "Guinée"}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Informations */}
            <motion.div {...card(1)}>
              <Card padding="lg">
                <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Informations</h2>
                <div className="space-y-4">
                  <Input
                    label={form.type === "company" ? "Nom de l'entreprise" : "Nom complet"}
                    value={form.name} onChange={set("name")}
                    placeholder={form.type === "company" ? "ACME SARL" : "Jean Dupont"}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="contact@entreprise.fr" autoComplete="email" />
                    <Input label="Téléphone" type="tel" value={form.phone} onChange={set("phone")} placeholder="06 XX XX XX XX" autoComplete="tel" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Identifiants fiscaux — uniquement entreprise */}
            <AnimatePresence>
              {form.type === "company" && (
                <motion.div
                  key="fiscal"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto", transition: { duration: 0.25, ease } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
                  style={{ overflow: "hidden" }}
                >
                  <Card padding="lg">
                    <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Identifiants fiscaux</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {form.market === "france" ? (
                        <>
                          <Input label="SIREN / SIRET" value={form.siren} onChange={set("siren")} placeholder="123 456 789" hint="9 ou 14 chiffres" />
                          <Input label="N° TVA intracommunautaire" value={form.vat_number} onChange={set("vat_number")} placeholder="FR XX 123456789" />
                        </>
                      ) : (
                        <Input label="NIF (Numéro d'Identification Fiscale)" value={form.nif} onChange={set("nif")} placeholder="NIF Guinée" className="col-span-2" />
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Adresse */}
            <motion.div {...card(2)}>
              <Card padding="lg">
                <h2 className="font-heading text-sm font-semibold text-[var(--color-text)] mb-4">Adresse</h2>
                <div className="space-y-4">
                  <Input label="Adresse" value={form.address} onChange={set("address")} placeholder="42 rue de la République" />
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Code postal" value={form.zip} onChange={set("zip")} placeholder="75001" />
                    <Input label="Ville" value={form.city} onChange={set("city")} placeholder="Paris" className="col-span-2" />
                  </div>
                  <Select label="Pays" value={form.country} onChange={set("country")}>
                    <option value="France">France</option>
                    <option value="Guinée">Guinée</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Maroc">Maroc</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Autre">Autre</option>
                  </Select>
                </div>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div {...card(3)}>
              <Card padding="lg">
                <Textarea
                  label="Notes internes"
                  value={form.notes} onChange={set("notes")}
                  placeholder="Informations complémentaires, contacts clés, délais préférés…"
                  rows={3}
                  hint="Visible uniquement pour vous"
                />
              </Card>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-[var(--color-danger)] px-1"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div {...card(4)} className="flex gap-3 pb-6">
              <Button type="submit" loading={isPending} className="flex-1">
                {isEdit ? "Enregistrer les modifications" : "Créer le client"}
              </Button>
              <Link href="/clients">
                <Button type="button" variant="secondary">Annuler</Button>
              </Link>
            </motion.div>
          </form>

          {/* ── Right: Live preview ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.15, ease } }}
            className="hidden xl:block"
            style={{ position: "sticky", top: "calc(var(--header-height) + 1.5rem)" }}
          >
            <ClientPreview form={form} />
          </motion.div>
        </div>
      </PageWrapper>
    </>
  );
}

"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { updateProfileAction, updateDefaultMarketAction } from "@/lib/actions/profile";
import { CheckCircle2, Globe, Building2, Landmark, Hash } from "lucide-react";
import type { Profile, Market } from "@/types/database";

interface Props {
  profile: Profile | null;
}

const MARKET_COUNTRY: Record<Market, string> = { france: "France", guinee: "Guinée" };

type TabKey = "market" | "company" | "bank" | "documents";

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "market", label: "Marché", icon: <Globe className="w-3.5 h-3.5" /> },
  { key: "company", label: "Entreprise", icon: <Building2 className="w-3.5 h-3.5" /> },
  { key: "bank", label: "Banque", icon: <Landmark className="w-3.5 h-3.5" /> },
  { key: "documents", label: "Documents", icon: <Hash className="w-3.5 h-3.5" /> },
];

export function SettingsForm({ profile: p }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketPending, startMarketTransition] = useTransition();
  const [market, setMarket] = useState<Market>(p?.default_market ?? "france");
  const [tab, setTab] = useState<TabKey>("market");
  const isFrance = market === "france";

  const [form, setForm] = useState({
    company_name: p?.company_name ?? "",
    company_siren: p?.company_siren ?? "",
    company_nif: p?.company_nif ?? "",
    vat_number: p?.vat_number ?? "",
    company_email: p?.company_email ?? "",
    company_phone: p?.company_phone ?? "",
    company_website: p?.company_website ?? "",
    company_address: p?.company_address ?? "",
    company_city: p?.company_city ?? "",
    company_zip: p?.company_zip ?? "",
    company_country: p?.company_country ?? "France",
    bank_name: p?.bank_name ?? "",
    bank_iban: p?.bank_iban ?? "",
    bank_bic: p?.bank_bic ?? "",
    invoice_prefix_fr: p?.invoice_prefix_fr ?? "FAC-FR-",
    invoice_prefix_gn: p?.invoice_prefix_gn ?? "FAC-GN-",
    quote_prefix_fr: p?.quote_prefix_fr ?? "DEV-FR-",
    quote_prefix_gn: p?.quote_prefix_gn ?? "DEV-GN-",
    payment_terms_days: p?.payment_terms_days ?? 30,
    legal_mention: p?.legal_mention ?? "",
  });

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.type === "number" ? parseInt(e.target.value) || 0 : e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        const payload = Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? (v || undefined) : v]),
        );
        await updateProfileAction(payload);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
      }
    });
  };

  const handleMarketChange = (m: Market) => {
    setMarket(m);
    setForm((prev) => ({ ...prev, company_country: MARKET_COUNTRY[m] }));
    startMarketTransition(async () => {
      await updateDefaultMarketAction(m).catch(console.error);
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">

      {/* Onglets horizontaux — scrollables sur mobile */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-2)] border border-[var(--color-border)] overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 shrink-0 px-3 sm:px-4 h-9 rounded-[calc(var(--radius-md)-2px)] text-xs sm:text-sm font-medium transition-all duration-[var(--dur-fast)] cursor-pointer ${
              tab === t.key
                ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-[var(--shadow-xs)]"
                : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Marché par défaut */}
      {tab === "market" && (
        <Card padding="lg">
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-1">Marché par défaut</h2>
          <p className="text-xs text-[var(--color-text-2)] mb-4">
            Détermine la devise, les identifiants fiscaux et la numérotation appliqués par défaut.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["france", "guinee"] as Market[]).map((m) => {
              const active = market === m;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={marketPending}
                  onClick={() => handleMarketChange(m)}
                  className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium text-center transition-colors duration-[var(--dur-fast)] cursor-pointer ${
                    active
                      ? m === "france"
                        ? "border-[var(--color-fr)] bg-[var(--color-fr-dim)] text-[var(--color-fr)]"
                        : "border-[var(--color-gn)] bg-[var(--color-gn-dim)] text-[var(--color-gn)]"
                      : "border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-border-2)]"
                  }`}
                >
                  {m === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}
                  {active && <span className="ml-2 text-xs">(actif)</span>}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Entreprise + identifiants fiscaux du marché actif */}
      {tab === "company" && (
        <Card padding="lg">
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Entreprise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            <Input label="Nom de l'entreprise" value={form.company_name} onChange={set("company_name")} placeholder="BaldEngineer SARL" className="sm:col-span-2" />
            <Input label="Email" type="email" value={form.company_email} onChange={set("company_email")} placeholder="contact@baldengineer.fr" />
            <Input label="Téléphone" type="tel" value={form.company_phone} onChange={set("company_phone")} placeholder="06 XX XX XX XX" />
            <Input label="Site web" type="url" value={form.company_website} onChange={set("company_website")} placeholder="https://baldengineer.fr" className="sm:col-span-2" />
            <Input label="Adresse" value={form.company_address} onChange={set("company_address")} placeholder="42 rue Jacques Benoist" className="sm:col-span-2" />
            <Input label="Code postal" value={form.company_zip} onChange={set("company_zip")} placeholder="27140" />
            <Input label="Ville" value={form.company_city} onChange={set("company_city")} placeholder="Gisors" />
            <Select label="Pays" value={form.company_country} onChange={set("company_country")} className="sm:col-span-2">
              <option>France</option>
              <option>Guinée</option>
              <option>Belgique</option>
              <option>Suisse</option>
              <option>Autre</option>
            </Select>

            <div className="sm:col-span-2 pt-2 mt-1 border-t border-[var(--color-border)]">
              <p className="text-xs font-medium text-[var(--color-text-2)] mb-3">
                Identifiants fiscaux · {market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}
              </p>
              {isFrance ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="SIREN / SIRET" value={form.company_siren} onChange={set("company_siren")} placeholder="123 456 789 00012" />
                  <Input label="N° TVA intracommunautaire" value={form.vat_number} onChange={set("vat_number")} placeholder="FR XX 123456789" />
                </div>
              ) : (
                <Input label="NIF" value={form.company_nif} onChange={set("company_nif")} placeholder="Numéro d'identification fiscale" />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Coordonnées bancaires */}
      {tab === "bank" && (
        <Card padding="lg">
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Coordonnées bancaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            <Input label="Banque" value={form.bank_name} onChange={set("bank_name")} placeholder="Crédit Agricole" className="sm:col-span-2" />
            <Input label="IBAN" value={form.bank_iban} onChange={set("bank_iban")} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" />
            <Input label="BIC / SWIFT" value={form.bank_bic} onChange={set("bank_bic")} placeholder="AGRIFRPP" />
          </div>
        </Card>
      )}

      {/* Numérotation du marché actif + mentions légales */}
      {tab === "documents" && (
        <Card padding="lg">
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {isFrance ? (
              <>
                <Input label="Préfixe devis" value={form.quote_prefix_fr} onChange={set("quote_prefix_fr")} />
                <Input label="Préfixe facture" value={form.invoice_prefix_fr} onChange={set("invoice_prefix_fr")} />
              </>
            ) : (
              <>
                <Input label="Préfixe devis" value={form.quote_prefix_gn} onChange={set("quote_prefix_gn")} />
                <Input label="Préfixe facture" value={form.invoice_prefix_gn} onChange={set("invoice_prefix_gn")} />
              </>
            )}
            <Input
              label="Délai de paiement (jours)"
              type="number"
              value={form.payment_terms_days}
              onChange={set("payment_terms_days")}
              min="0"
              hint="Appliqué par défaut sur les nouvelles factures"
              className="sm:col-span-2"
            />
            <Textarea
              label="Mentions légales (factures)"
              value={form.legal_mention}
              onChange={set("legal_mention")}
              rows={3}
              placeholder="TVA non applicable, art. 293 B du CGI…"
              className="sm:col-span-2"
            />
          </div>
        </Card>
      )}

      {error && <p className="text-sm text-[var(--color-danger)] px-1">{error}</p>}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pb-5">
        <Button type="submit" loading={isPending} className="flex-1">
          Enregistrer les modifications
        </Button>
        {success && (
          <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--color-success)]">
            <CheckCircle2 className="w-4 h-4" />
            Sauvegardé
          </div>
        )}
      </div>
    </form>
  );
}

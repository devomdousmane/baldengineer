"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { updateProfileAction, updateDefaultMarketAction } from "@/lib/actions/profile";
import { CheckCircle2 } from "lucide-react";
import type { Profile, Market } from "@/types/database";

interface Props {
  profile: Profile | null;
}

export function SettingsForm({ profile: p }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketPending, startMarketTransition] = useTransition();

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

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.type === "number" ? parseInt(e.target.value) || 0 : e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateProfileAction({
          company_name: form.company_name || undefined,
          company_siren: form.company_siren || undefined,
          company_nif: form.company_nif || undefined,
          vat_number: form.vat_number || undefined,
          company_email: form.company_email || undefined,
          company_phone: form.company_phone || undefined,
          company_website: form.company_website || undefined,
          company_address: form.company_address || undefined,
          company_city: form.company_city || undefined,
          company_zip: form.company_zip || undefined,
          company_country: form.company_country || undefined,
          bank_name: form.bank_name || undefined,
          bank_iban: form.bank_iban || undefined,
          bank_bic: form.bank_bic || undefined,
          invoice_prefix_fr: form.invoice_prefix_fr || undefined,
          invoice_prefix_gn: form.invoice_prefix_gn || undefined,
          quote_prefix_fr: form.quote_prefix_fr || undefined,
          quote_prefix_gn: form.quote_prefix_gn || undefined,
          payment_terms_days: form.payment_terms_days,
          legal_mention: form.legal_mention || undefined,
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
      }
    });
  };

  const handleMarketChange = (market: Market) => {
    startMarketTransition(async () => {
      await updateDefaultMarketAction(market).catch(console.error);
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl">

      {/* Marché par défaut */}
      <Card padding="lg">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Marché par défaut</h2>
        <div className="flex gap-3">
          {(["france", "guinee"] as Market[]).map((m) => {
            const active = p?.default_market === m;
            return (
              <button
                key={m}
                type="button"
                disabled={marketPending}
                onClick={() => handleMarketChange(m)}
                className={`flex-1 rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium text-center transition-colors duration-[var(--dur-fast)] ${
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

      {/* Entreprise */}
      <Card padding="lg">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Informations entreprise</h2>
        <div className="space-y-4">
          <Input label="Nom de l'entreprise" value={form.company_name} onChange={set("company_name")} placeholder="BaldEngineer SARL" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.company_email} onChange={set("company_email")} placeholder="contact@baldengineer.fr" />
            <Input label="Téléphone" type="tel" value={form.company_phone} onChange={set("company_phone")} placeholder="06 XX XX XX XX" />
          </div>
          <Input label="Site web" type="url" value={form.company_website} onChange={set("company_website")} placeholder="https://baldengineer.fr" />
          <Input label="Adresse" value={form.company_address} onChange={set("company_address")} placeholder="42 rue Jacques Benoist" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Code postal" value={form.company_zip} onChange={set("company_zip")} placeholder="27140" />
            <Input label="Ville" value={form.company_city} onChange={set("company_city")} placeholder="Gisors" className="col-span-2" />
          </div>
          <Select label="Pays" value={form.company_country} onChange={set("company_country")}>
            <option>France</option>
            <option>Guinée</option>
            <option>Belgique</option>
            <option>Suisse</option>
            <option>Autre</option>
          </Select>
        </div>
      </Card>

      {/* Identifiants fiscaux */}
      <Card padding="lg">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Identifiants fiscaux</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="SIREN / SIRET" value={form.company_siren} onChange={set("company_siren")} placeholder="123 456 789 00012" hint="France" />
          <Input label="N° TVA intracommunautaire" value={form.vat_number} onChange={set("vat_number")} placeholder="FR XX 123456789" hint="France" />
          <Input label="NIF" value={form.company_nif} onChange={set("company_nif")} placeholder="NIF Guinée" hint="Guinée" className="col-span-2" />
        </div>
      </Card>

      {/* Coordonnées bancaires */}
      <Card padding="lg">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Coordonnées bancaires</h2>
        <div className="space-y-4">
          <Input label="Banque" value={form.bank_name} onChange={set("bank_name")} placeholder="Crédit Agricole" />
          <Input label="IBAN" value={form.bank_iban} onChange={set("bank_iban")} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" />
          <Input label="BIC / SWIFT" value={form.bank_bic} onChange={set("bank_bic")} placeholder="AGRIFRPP" />
        </div>
      </Card>

      {/* Numérotation */}
      <Card padding="lg">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Numérotation des documents</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Préfixe devis FR" value={form.quote_prefix_fr} onChange={set("quote_prefix_fr")} />
          <Input label="Préfixe devis GN" value={form.quote_prefix_gn} onChange={set("quote_prefix_gn")} />
          <Input label="Préfixe facture FR" value={form.invoice_prefix_fr} onChange={set("invoice_prefix_fr")} />
          <Input label="Préfixe facture GN" value={form.invoice_prefix_gn} onChange={set("invoice_prefix_gn")} />
          <Input
            label="Délai de paiement (jours)"
            type="number"
            value={form.payment_terms_days}
            onChange={set("payment_terms_days")}
            min="0"
            className="col-span-2"
            hint="Appliqué par défaut sur les nouvelles factures"
          />
        </div>
      </Card>

      {/* Mentions légales */}
      <Card padding="lg">
        <Textarea
          label="Mentions légales (factures)"
          value={form.legal_mention}
          onChange={set("legal_mention")}
          rows={3}
          placeholder="TVA non applicable, art. 293 B du CGI…"
          hint="Affiché en pied de page des factures"
        />
      </Card>

      {error && <p className="text-sm text-[var(--color-danger)] px-1">{error}</p>}

      <div className="flex items-center gap-3 pb-5">
        <Button type="submit" loading={isPending} className="flex-1">
          Enregistrer les modifications
        </Button>
        {success && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-success)]">
            <CheckCircle2 className="w-4 h-4" />
            Sauvegardé
          </div>
        )}
      </div>
    </form>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/forms/settings-form";
import { DemoDataPanel } from "@/components/modules/demo-data-panel";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import type { Profile } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Informations entreprise",
    body: "Renseignez votre raison sociale, SIREN (France) ou NIF (Guinée), adresse et coordonnées. Ces informations apparaissent sur tous vos documents.",
  },
  {
    title: "Numérotation",
    body: "Définissez vos préfixes de numérotation (ex. FAC-FR- / FAC-GN-). Les compteurs s'incrémentent automatiquement à chaque création.",
  },
  {
    title: "Coordonnées bancaires",
    body: "Ajoutez votre IBAN et BIC. Ils apparaissent au bas de chaque facture imprimée pour faciliter le paiement par virement.",
  },
  {
    title: "Mentions légales",
    body: "Saisissez vos mentions obligatoires (ex. « TVA non applicable, article 293B du CGI »). Elles s'ajoutent automatiquement à vos documents.",
  },
  {
    title: "Marché par défaut",
    body: "Choisissez France ou Guinée comme marché de départ. Vous pouvez le changer à tout moment depuis la barre latérale.",
  },
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user!.id).single();

  return (
    <>
      <Header title="Paramètres" subtitle="Gérez les informations de votre entreprise" />
      <PageWrapper
        aside={
          <PageAside
            title="Configuration"
            description="Ces paramètres s'appliquent à tous vos documents (devis, factures) et définissent votre identité professionnelle."
            tips={ASIDE_TIPS}
          />
        }
      >
        <SettingsForm profile={profile as Profile | null} />
        <DemoDataPanel />
      </PageWrapper>
    </>
  );
}

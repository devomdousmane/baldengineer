import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/forms/settings-form";
import { DemoDataPanel } from "@/components/modules/demo-data-panel";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import type { Profile } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Marché par défaut",
    body: "Les champs fiscaux et la numérotation s'adaptent automatiquement au marché sélectionné.",
  },
  {
    title: "Coordonnées bancaires",
    body: "IBAN/BIC apparaissent en pied de facture.",
  },
  {
    title: "Numérotation",
    body: "Préfixes appliqués automatiquement à chaque nouveau devis/facture.",
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
            description="S'applique à tous vos devis et factures."
            tips={ASIDE_TIPS}
          />
        }
      >
        <SettingsForm profile={profile as Profile | null} />

        <div className="max-w-3xl pt-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-3)]">
              Zone développeur
            </p>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
          <DemoDataPanel />
        </div>
      </PageWrapper>
    </>
  );
}

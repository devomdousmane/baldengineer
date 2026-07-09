import { createClient } from "@/lib/supabase/server";
import { getWorkspaceProfile } from "@/lib/workspace";
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
  const profile = await getWorkspaceProfile(supabase, user!.id);

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

        <div className="max-w-3xl pt-4 mt-2 border-t-2 border-dashed border-[var(--color-warning-dim)]">
          <div className="flex items-center gap-2 mb-4 mt-4">
            <p className="text-3xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--color-warning-dim)", color: "var(--color-warning)" }}>
              Zone sensible — données de test et réinitialisation
            </p>
          </div>
          <DemoDataPanel />
        </div>
      </PageWrapper>
    </>
  );
}

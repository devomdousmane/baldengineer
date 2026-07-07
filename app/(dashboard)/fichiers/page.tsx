import { getCompanyFiles } from "@/lib/actions/files";
import { getCompanyFolders } from "@/lib/actions/folders";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { FilesTable } from "@/components/tables/files-table";
import { FilesActions } from "@/components/modules/files-actions";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { KpiCard } from "@/components/ui/kpi-card";
import { FolderOpen, Receipt, HardDrive } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Ajouter un fichier",
    body: "PDF, Word, Excel ou image — 10 Mo max par fichier. Classez-le par marché et catégorie.",
  },
  {
    title: "Scanner une facture",
    body: "Depuis « Ajouter un fichier », utilisez « Scanner et créer une écriture comptable » : l'IA extrait le montant, la date et la catégorie, à valider avant enregistrement.",
  },
  {
    title: "Confidentialité",
    body: "Chaque fichier est stocké de façon privée — vous seul y avez accès.",
  },
];

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default async function FichiersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const [files, folders] = await Promise.all([
    getCompanyFiles(market),
    getCompanyFolders(market),
  ]);

  const totalSize = files.reduce((s, f) => s + f.size_bytes, 0);
  const invoiceCount = files.filter((f) => f.category === "facture").length;

  return (
    <>
      <Header
        title="Fichiers"
        subtitle={`${files.length} fichier${files.length !== 1 ? "s" : ""}`}
        actions={<FilesActions defaultMarket={market} />}
      />
      <PageWrapper
        aside={
          <PageAside
            title="Fichiers"
            description="Bibliothèque de documents d'entreprise — contrats, factures, RIB, justificatifs."
            tips={ASIDE_TIPS}
          />
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KpiCard
            label="Total fichiers"
            value={String(files.length)}
            icon={<FolderOpen className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={0}
          />
          <KpiCard
            label="Factures scannées"
            value={String(invoiceCount)}
            icon={<Receipt className="w-4 h-4" />}
            accentColor="var(--color-warning)"
            index={1}
          />
          <KpiCard
            label="Espace utilisé"
            value={fmtSize(totalSize)}
            icon={<HardDrive className="w-4 h-4" />}
            accentColor="var(--color-info)"
            index={2}
          />
        </div>
        <FilesTable files={files} folders={folders} market={market} />
      </PageWrapper>
    </>
  );
}

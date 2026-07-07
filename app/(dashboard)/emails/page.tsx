import { createClient } from "@/lib/supabase/server";
import { getEmailLogs } from "@/lib/actions/email-logs";
import { Header } from "@/components/layout/header";
import { EmailLogsTable } from "@/components/tables/email-logs-table";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { KpiCard } from "@/components/ui/kpi-card";
import { Send, CheckCircle2, XCircle, FileText } from "lucide-react";
import type { Market } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Que montre cette page ?",
    body: "L'historique des devis et factures envoyés par email, avec le statut de l'envoi et le statut actuel du document.",
  },
  {
    title: "Statut d'envoi vs statut document",
    body: "« Envoi » indique si l'email est parti (ou a échoué). « Statut document » montre où en est le devis/la facture aujourd'hui (accepté, payé, en retard…).",
  },
  {
    title: "Accéder au document",
    body: "Cliquez sur une ligne pour ouvrir directement le devis ou la facture concernée.",
  },
];

export default async function EmailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("default_market").eq("id", user!.id).single();

  const market = (profile?.default_market ?? "france") as Market;
  const logs = await getEmailLogs(market);

  const sentCount = logs.filter((l) => l.status === "sent" || l.status === "delivered").length;
  const failedCount = logs.filter((l) => l.status === "failed" || l.status === "bounced").length;
  const successRate = logs.length > 0 ? Math.round((sentCount / logs.length) * 100) : 100;
  const quoteEmails = logs.filter((l) => l.resourceType === "quote").length;

  return (
    <>
      <Header
        title="Suivi des emails"
        subtitle={`${logs.length} email${logs.length !== 1 ? "s" : ""} · ${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}`}
      />
      <PageWrapper
        aside={
          <PageAside
            title="Suivi des envois"
            description="Historique des devis et factures envoyés par email."
            tips={ASIDE_TIPS}
          />
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Emails envoyés"
            value={String(logs.length)}
            icon={<Send className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={0}
          />
          <KpiCard
            label="Livrés"
            value={String(sentCount)}
            icon={<CheckCircle2 className="w-4 h-4" />}
            accentColor="var(--color-success)"
            index={1}
          />
          <KpiCard
            label="Échecs"
            value={String(failedCount)}
            icon={<XCircle className="w-4 h-4" />}
            accentColor="var(--color-danger)"
            trend={failedCount > 0 ? "down" : "neutral"}
            index={2}
          />
          <KpiCard
            label="Taux de succès"
            value={`${successRate}%`}
            subtitle={`${quoteEmails} devis · ${logs.length - quoteEmails} factures`}
            icon={<FileText className="w-4 h-4" />}
            accentColor="var(--color-info)"
            trend={successRate >= 90 ? "up" : "down"}
            index={3}
          />
        </div>

        <EmailLogsTable logs={logs} />
      </PageWrapper>
    </>
  );
}

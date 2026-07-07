import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PageAside } from "@/components/layout/page-aside";
import { KpiCard } from "@/components/ui/kpi-card";
import { VisitsChart, CountryBreakdownChart } from "@/components/modules/visits-chart";
import { Eye, Globe, FileText } from "lucide-react";
import type { SiteVisit } from "@/types/database";

const ASIDE_TIPS = [
  {
    title: "Mesure d'audience",
    body: "Les visites du site vitrine (baldengineer.fr) sont comptabilisées de façon anonyme : aucune adresse IP n'est conservée, seuls le pays et la ville sont déduits côté serveur.",
  },
  {
    title: "Conformité",
    body: "Ce compteur relève de la mesure d'audience exemptée de consentement (recommandation CNIL) — pas de cookie identifiant, pas de suivi entre sites.",
  },
];

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: visitsRaw } = await supabase
    .from("site_visits")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  const visits = (visitsRaw ?? []) as SiteVisit[];

  /* Agrégation par jour (30 derniers jours, jours vides inclus) */
  const byDay = new Map<string, number>();
  for (const v of visits) {
    const day = v.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const dailySeries = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: byDay.get(key) ?? 0 };
  });

  /* Agrégation par pays */
  const byCountry = new Map<string, number>();
  for (const v of visits) {
    const key = v.country ?? "—";
    byCountry.set(key, (byCountry.get(key) ?? 0) + 1);
  }
  const countryBreakdown = Array.from(byCountry.entries()).map(([country, count]) => ({ country, count }));

  /* Pages les plus vues */
  const byPath = new Map<string, number>();
  for (const v of visits) {
    byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1);
  }
  const topPages = Array.from(byPath.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const totalVisits = visits.length;
  const uniqueCountries = byCountry.size;
  const last7 = visits.filter((v) => new Date(v.created_at).getTime() >= Date.now() - 7 * 86400000).length;

  return (
    <>
      <Header
        title="Visites"
        subtitle={`${totalVisits} visite${totalVisits !== 1 ? "s" : ""} · 30 derniers jours`}
      />
      <PageWrapper
        aside={
          <PageAside
            title="Visites"
            description="Trafic du site vitrine baldengineer.fr."
            tips={ASIDE_TIPS}
          />
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KpiCard
            label="Visites (30j)"
            value={String(totalVisits)}
            icon={<Eye className="w-4 h-4" />}
            accentColor="var(--color-accent)"
            index={0}
          />
          <KpiCard
            label="Visites (7j)"
            value={String(last7)}
            icon={<FileText className="w-4 h-4" />}
            accentColor="var(--color-info)"
            index={1}
          />
          <KpiCard
            label="Pays distincts"
            value={String(uniqueCountries)}
            icon={<Globe className="w-4 h-4" />}
            accentColor="var(--color-gn)"
            index={2}
          />
        </div>

        <VisitsChart data={dailySeries} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CountryBreakdownChart data={countryBreakdown} />

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text)] mb-0.5">Pages les plus vues</h2>
            <p className="text-xs text-[var(--color-text-3)] mb-4">30 derniers jours</p>
            {topPages.length === 0 ? (
              <p className="text-xs text-[var(--color-text-3)] py-8 text-center">Aucune donnée pour le moment</p>
            ) : (
              <ul className="space-y-2">
                {topPages.map(([path, count]) => (
                  <li key={path} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--color-text)] font-mono text-xs truncate">{path}</span>
                    <span className="text-[var(--color-text-2)] font-medium tabular-nums shrink-0">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

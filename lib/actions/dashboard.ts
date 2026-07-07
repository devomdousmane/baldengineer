"use server";

import { createClient as createSupabase } from "@/lib/supabase/server";
import type { Market } from "@/types/database";

export type Period = "month" | "quarter" | "year";
export type MarketFilter = Market | "all";

export interface StatusBreakdownItem {
  status: string;
  count: number;
  amount: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  market: Market;
}

export interface DashboardData {
  kpis: {
    period_revenue: number;
    revenue_year: number;
    pending_quotes: number;
    pending_quotes_amount: number;
    unpaid_invoices: number;
    unpaid_invoices_amount: number;
    active_missions: number;
    overdue_invoices: number;
    overdue_amount: number;
    total_clients: number;
    collection_rate: number;
    conversion_rate: number;
    upcoming_missions_count: number;
  };
  upcomingMissions: { id: string; title: string; startDate: string | null; endDate: string | null; client: string }[];
  chartData: { month: string; france: number; guinee: number }[];
  invoiceStatusBreakdown: StatusBreakdownItem[];
  quoteStatusBreakdown: StatusBreakdownItem[];
  recentInvoices: { id: string; number: string; client: string; amount: number; status: string; date: string }[];
  currency: string;
  market: MarketFilter;
  period: Period;
  year: number;
}

function periodRange(period: Period): { start: string; end: string } {
  const now = new Date();

  if (period === "quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1);
    return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
  }

  if (period === "year") {
    return { start: `${now.getFullYear()}-01-01`, end: now.toISOString().slice(0, 10) };
  }

  /* month (default) */
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
}

export async function getDashboardData(period: Period = "month", marketParam?: MarketFilter): Promise<DashboardData> {
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      kpis: {
        period_revenue: 0, revenue_year: 0,
        pending_quotes: 0, pending_quotes_amount: 0,
        unpaid_invoices: 0, unpaid_invoices_amount: 0,
        active_missions: 0, overdue_invoices: 0, overdue_amount: 0,
        total_clients: 0, collection_rate: 0, conversion_rate: 0,
        upcoming_missions_count: 0,
      },
      upcomingMissions: [], chartData: [], invoiceStatusBreakdown: [],
      quoteStatusBreakdown: [], recentInvoices: [],
      currency: "EUR", market: "france", period, year: new Date().getFullYear(),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_market, currency_fr, currency_gn")
    .eq("id", user.id)
    .single();

  const defaultMarket = (profile?.default_market ?? "france") as Market;
  const currency = defaultMarket === "france" ? (profile?.currency_fr ?? "EUR") : (profile?.currency_gn ?? "GNF");

  const market = marketParam ?? defaultMarket;
  const marketFilter: Market | null = market === "all" ? null : market;
  /* En mode "Tous", les montants restent dans la devise du marché par défaut du profil. */
  const amountsMarket = marketFilter ?? defaultMarket;

  const { start, end } = periodRange(period);
  const now = new Date();
  const year = now.getFullYear();
  const in7days = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  let periodRevenueQ = supabase.from("invoices").select("paid_amount").eq("user_id", user.id).eq("status", "paid").gte("paid_at", start).lte("paid_at", end);
  if (amountsMarket) periodRevenueQ = periodRevenueQ.eq("market", amountsMarket);

  let yearRevenueQ = supabase.from("invoices").select("paid_amount").eq("user_id", user.id).eq("status", "paid").gte("paid_at", `${year}-01-01`);
  if (amountsMarket) yearRevenueQ = yearRevenueQ.eq("market", amountsMarket);

  let quotesQ = supabase.from("quotes").select("total_ttc").eq("user_id", user.id).in("status", ["draft", "sent"]);
  if (amountsMarket) quotesQ = quotesQ.eq("market", amountsMarket);

  let unpaidQ = supabase.from("invoices").select("total_ttc, paid_amount").eq("user_id", user.id).in("status", ["sent", "partial"]);
  if (amountsMarket) unpaidQ = unpaidQ.eq("market", amountsMarket);

  let overdueQ = supabase.from("invoices").select("total_ttc, paid_amount").eq("user_id", user.id).eq("status", "overdue");
  if (amountsMarket) overdueQ = overdueQ.eq("market", amountsMarket);

  let missionsQ = supabase.from("missions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active");
  if (marketFilter) missionsQ = missionsQ.eq("market", marketFilter);

  let clientsQ = supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true);
  if (marketFilter) clientsQ = clientsQ.eq("market", marketFilter);

  let allPaidQ = supabase.from("invoices").select("total_ttc, paid_amount").eq("user_id", user.id).in("status", ["paid", "partial"]);
  if (amountsMarket) allPaidQ = allPaidQ.eq("market", amountsMarket);

  let recentQ = supabase.from("invoices").select("id, number, total_ttc, status, date, client_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6);
  if (marketFilter) recentQ = recentQ.eq("market", marketFilter);

  let decidedQuotesQ = supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["accepted", "refused", "expired"]);
  if (marketFilter) decidedQuotesQ = decidedQuotesQ.eq("market", marketFilter);

  let acceptedQuotesQ = supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "accepted");
  if (marketFilter) acceptedQuotesQ = acceptedQuotesQ.eq("market", marketFilter);

  let upcomingMissionsQ = supabase.from("missions").select("id, title, start_date, end_date, client_id")
    .eq("user_id", user.id).eq("status", "active")
    .or(`and(start_date.gte.${today},start_date.lte.${in7days}),and(end_date.gte.${today},end_date.lte.${in7days})`);
  if (marketFilter) upcomingMissionsQ = upcomingMissionsQ.eq("market", marketFilter);

  const [
    periodRevenueRes, yearRevenueRes, quotesRes, unpaidRes, overdueRes,
    missionsRes, clientsRes, allPaidRes, recentRes,
    decidedQuotesRes, acceptedQuotesRes, upcomingMissionsRes,
  ] = await Promise.all([
    periodRevenueQ, yearRevenueQ, quotesQ, unpaidQ, overdueQ,
    missionsQ, clientsQ, allPaidQ, recentQ,
    decidedQuotesQ, acceptedQuotesQ, upcomingMissionsQ,
  ]);

  const sum = (rows: { paid_amount?: number }[]) => rows.reduce((a, r) => a + (r.paid_amount ?? 0), 0);
  const sumTtc = (rows: { total_ttc?: number }[]) => rows.reduce((a, r) => a + (r.total_ttc ?? 0), 0);
  const remaining = (rows: { total_ttc?: number; paid_amount?: number }[]) =>
    rows.reduce((a, r) => a + Math.max(0, (r.total_ttc ?? 0) - (r.paid_amount ?? 0)), 0);

  const allPaid = allPaidRes.data ?? [];
  const totalBilled = sumTtc(allPaid);
  const totalCollected = sum(allPaid as { paid_amount?: number }[]);
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

  const decidedCount = decidedQuotesRes.count ?? 0;
  const acceptedCount = acceptedQuotesRes.count ?? 0;
  const conversionRate = decidedCount > 0 ? (acceptedCount / decidedCount) * 100 : 0;

  /* Fetch client names for recent invoices */
  const clientIds = (recentRes.data ?? []).map((r: { client_id?: string }) => r.client_id).filter(Boolean) as string[];
  const { data: clientNames } = clientIds.length
    ? await supabase.from("clients").select("id, name").in("id", clientIds)
    : { data: [] };
  const clientMap = Object.fromEntries((clientNames ?? []).map((c: { id: string; name: string }) => [c.id, c.name]));

  const recentInvoices = (recentRes.data ?? []).map((inv: { id: string; number: string; total_ttc: number; status: string; date: string; client_id?: string }) => ({
    id: inv.id,
    number: inv.number,
    amount: inv.total_ttc,
    status: inv.status,
    date: inv.date,
    client: clientMap[inv.client_id ?? ""] ?? "—",
  }));

  const upcomingMissions = (upcomingMissionsRes.data ?? []).map((m: { id: string; title: string; start_date: string | null; end_date: string | null; client_id?: string }) => ({
    id: m.id,
    title: m.title,
    startDate: m.start_date,
    endDate: m.end_date,
    client: clientMap[m.client_id ?? ""] ?? "—",
  }));

  /* Revenue chart — paid invoices per month for current year, filtré par marché */
  let chartQ = supabase
    .from("invoices")
    .select("paid_amount, paid_at, market")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .gte("paid_at", `${year}-01-01`)
    .lte("paid_at", `${year}-12-31`);
  if (marketFilter) chartQ = chartQ.eq("market", marketFilter);
  const { data: chartRaw } = await chartQ;

  const chartMap = new Map<string, { france: number; guinee: number }>();
  for (const row of (chartRaw ?? [])) {
    if (!row.paid_at) continue;
    const month = (row.paid_at as string).slice(0, 7);
    const existing = chartMap.get(month) ?? { france: 0, guinee: 0 };
    if (row.market === "france") existing.france += row.paid_amount ?? 0;
    else existing.guinee += row.paid_amount ?? 0;
    chartMap.set(month, existing);
  }
  const chartData = Array.from(chartMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, france: v.france, guinee: v.guinee }));

  /* Répartition des factures par statut (filtrée par marché) */
  let statusBreakdownQ = supabase.from("invoices").select("status, total_ttc").eq("user_id", user.id);
  if (marketFilter) statusBreakdownQ = statusBreakdownQ.eq("market", marketFilter);
  const { data: statusRaw } = await statusBreakdownQ;

  const statusMap = new Map<string, { count: number; amount: number }>();
  for (const row of (statusRaw ?? [])) {
    const existing = statusMap.get(row.status) ?? { count: 0, amount: 0 };
    existing.count += 1;
    existing.amount += row.total_ttc ?? 0;
    statusMap.set(row.status, existing);
  }
  const invoiceStatusBreakdown = Array.from(statusMap.entries()).map(([status, v]) => ({ status, ...v }));

  /* Répartition des devis par statut (filtrée par marché) */
  let quoteStatusQ = supabase.from("quotes").select("status, total_ttc").eq("user_id", user.id);
  if (marketFilter) quoteStatusQ = quoteStatusQ.eq("market", marketFilter);
  const { data: quoteStatusRaw } = await quoteStatusQ;

  const quoteStatusMap = new Map<string, { count: number; amount: number }>();
  for (const row of (quoteStatusRaw ?? [])) {
    const existing = quoteStatusMap.get(row.status) ?? { count: 0, amount: 0 };
    existing.count += 1;
    existing.amount += row.total_ttc ?? 0;
    quoteStatusMap.set(row.status, existing);
  }
  const quoteStatusBreakdown = Array.from(quoteStatusMap.entries()).map(([status, v]) => ({ status, ...v }));

  return {
    kpis: {
      period_revenue: Math.round(sum((periodRevenueRes.data ?? []) as { paid_amount?: number }[]) * 100) / 100,
      revenue_year: Math.round(sum((yearRevenueRes.data ?? []) as { paid_amount?: number }[]) * 100) / 100,
      pending_quotes: quotesRes.data?.length ?? 0,
      pending_quotes_amount: Math.round(sumTtc(quotesRes.data ?? []) * 100) / 100,
      unpaid_invoices: unpaidRes.data?.length ?? 0,
      unpaid_invoices_amount: Math.round(remaining(unpaidRes.data ?? []) * 100) / 100,
      active_missions: missionsRes.count ?? 0,
      overdue_invoices: overdueRes.data?.length ?? 0,
      overdue_amount: Math.round(remaining(overdueRes.data ?? []) * 100) / 100,
      total_clients: clientsRes.count ?? 0,
      collection_rate: Math.round(collectionRate * 10) / 10,
      conversion_rate: Math.round(conversionRate * 10) / 10,
      upcoming_missions_count: upcomingMissions.length,
    },
    upcomingMissions,
    chartData,
    invoiceStatusBreakdown,
    quoteStatusBreakdown,
    recentInvoices,
    currency,
    market,
    period,
    year,
  };
}

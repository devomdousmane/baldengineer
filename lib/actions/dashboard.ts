"use server";

import { createClient as createSupabase } from "@/lib/supabase/server";
import type { Market } from "@/types/database";

export interface DashboardKPIs {
  revenue_month: number;
  revenue_year: number;
  pending_quotes: number;
  pending_quotes_amount: number;
  unpaid_invoices: number;
  unpaid_invoices_amount: number;
  active_missions: number;
  overdue_invoices: number;
  overdue_amount: number;
}

export async function getDashboardKPIs(market?: Market): Promise<DashboardKPIs> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return {
      revenue_month: 0, revenue_year: 0,
      pending_quotes: 0, pending_quotes_amount: 0,
      unpaid_invoices: 0, unpaid_invoices_amount: 0,
      active_missions: 0, overdue_invoices: 0, overdue_amount: 0,
    };
  }

  const now = new Date();
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const startOfYear = `${now.getFullYear()}-01-01`;
  const today = now.toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marketFilter = (q: any) =>
    market ? q.eq("market", market) : q;

  /* Revenue this month */
  const monthQ = marketFilter(
    supabase.from("invoices").select("paid_amount")
      .eq("user_id", user.user.id)
      .eq("status", "paid")
      .gte("paid_at", startOfMonth)
  );

  /* Revenue this year */
  const yearQ = marketFilter(
    supabase.from("invoices").select("paid_amount")
      .eq("user_id", user.user.id)
      .eq("status", "paid")
      .gte("paid_at", startOfYear)
  );

  /* Pending quotes */
  const quotesQ = marketFilter(
    supabase.from("quotes").select("total_ttc")
      .eq("user_id", user.user.id)
      .in("status", ["draft", "sent"])
  );

  /* Unpaid invoices (sent + partial) */
  const unpaidQ = marketFilter(
    supabase.from("invoices").select("total_ttc, paid_amount")
      .eq("user_id", user.user.id)
      .in("status", ["sent", "partial"])
  );

  /* Overdue invoices */
  const overdueQ = marketFilter(
    supabase.from("invoices").select("total_ttc, paid_amount")
      .eq("user_id", user.user.id)
      .eq("status", "overdue")
  );

  /* Active missions */
  const missionsQ = marketFilter(
    supabase.from("missions").select("id", { count: "exact", head: true })
      .eq("user_id", user.user.id)
      .eq("status", "active")
  );

  const [month, year, quotes, unpaid, overdue, missions] = await Promise.all([
    monthQ, yearQ, quotesQ, unpaidQ, overdueQ, missionsQ,
  ]);

  const sum = (rows: { paid_amount?: number; total_ttc?: number }[], key: "paid_amount" | "total_ttc") =>
    (rows ?? []).reduce((acc, r) => acc + (r[key] ?? 0), 0);

  const unpaidRemaining = (unpaid.data ?? []).reduce(
    (acc: number, r: { total_ttc?: number; paid_amount?: number }) =>
      acc + Math.max(0, (r.total_ttc ?? 0) - (r.paid_amount ?? 0)), 0
  );
  const overdueRemaining = (overdue.data ?? []).reduce(
    (acc: number, r: { total_ttc?: number; paid_amount?: number }) =>
      acc + Math.max(0, (r.total_ttc ?? 0) - (r.paid_amount ?? 0)), 0
  );

  return {
    revenue_month: Math.round(sum(month.data ?? [], "paid_amount") * 100) / 100,
    revenue_year: Math.round(sum(year.data ?? [], "paid_amount") * 100) / 100,
    pending_quotes: quotes.data?.length ?? 0,
    pending_quotes_amount: Math.round(sum(quotes.data ?? [], "total_ttc") * 100) / 100,
    unpaid_invoices: unpaid.data?.length ?? 0,
    unpaid_invoices_amount: Math.round(unpaidRemaining * 100) / 100,
    active_missions: missions.count ?? 0,
    overdue_invoices: overdue.data?.length ?? 0,
    overdue_amount: Math.round(overdueRemaining * 100) / 100,
  };
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  market: Market;
}

export async function getRevenueChart(year: number): Promise<RevenuePoint[]> {
  const supabase = await createSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from("invoices")
    .select("paid_amount, paid_at, market")
    .eq("user_id", user.user.id)
    .eq("status", "paid")
    .gte("paid_at", `${year}-01-01`)
    .lte("paid_at", `${year}-12-31`);

  if (error || !data) return [];

  const map = new Map<string, RevenuePoint>();
  for (const row of data) {
    if (!row.paid_at) continue;
    const month = row.paid_at.slice(0, 7);
    const key = `${month}-${row.market}`;
    const existing = map.get(key);
    if (existing) {
      existing.revenue += row.paid_amount ?? 0;
    } else {
      map.set(key, { month, revenue: row.paid_amount ?? 0, market: row.market as Market });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

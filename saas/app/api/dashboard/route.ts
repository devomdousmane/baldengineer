import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_market, currency_fr, currency_gn")
    .eq("id", user.id)
    .single();

  const market = profile?.default_market ?? "france";
  const currency = market === "france" ? (profile?.currency_fr ?? "EUR") : (profile?.currency_gn ?? "GNF");

  const now = new Date();
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const startOfYear = `${now.getFullYear()}-01-01`;

  const [monthRes, yearRes, quotesRes, unpaidRes, overdueRes, missionsRes, clientsRes, allPaidRes, recentRes] = await Promise.all([
    supabase.from("invoices").select("paid_amount").eq("user_id", user.id).eq("status", "paid").eq("market", market).gte("paid_at", startOfMonth),
    supabase.from("invoices").select("paid_amount").eq("user_id", user.id).eq("status", "paid").eq("market", market).gte("paid_at", startOfYear),
    supabase.from("quotes").select("total_ttc").eq("user_id", user.id).eq("market", market).in("status", ["draft", "sent"]),
    supabase.from("invoices").select("total_ttc, paid_amount").eq("user_id", user.id).eq("market", market).in("status", ["sent", "partial"]),
    supabase.from("invoices").select("total_ttc, paid_amount").eq("user_id", user.id).eq("market", market).eq("status", "overdue"),
    supabase.from("missions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("market", market).eq("status", "active"),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("market", market).eq("is_active", true),
    supabase.from("invoices").select("total_ttc, paid_amount").eq("user_id", user.id).eq("market", market).in("status", ["paid", "partial"]),
    supabase.from("invoices")
      .select("id, number, total_ttc, status, date, client_id")
      .eq("user_id", user.id)
      .eq("market", market)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const sum = (rows: { paid_amount?: number }[]) => rows.reduce((a, r) => a + (r.paid_amount ?? 0), 0);
  const sumTtc = (rows: { total_ttc?: number }[]) => rows.reduce((a, r) => a + (r.total_ttc ?? 0), 0);
  const remaining = (rows: { total_ttc?: number; paid_amount?: number }[]) =>
    rows.reduce((a, r) => a + Math.max(0, (r.total_ttc ?? 0) - (r.paid_amount ?? 0)), 0);

  const allPaid = allPaidRes.data ?? [];
  const totalBilled = sumTtc(allPaid);
  const totalCollected = sum(allPaid as { paid_amount?: number }[]);
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

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

  /* Revenue chart — paid invoices per month for current year, both markets */
  const year = now.getFullYear();
  const { data: chartRaw } = await supabase
    .from("invoices")
    .select("paid_amount, paid_at, market")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .gte("paid_at", `${year}-01-01`)
    .lte("paid_at", `${year}-12-31`);

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

  return NextResponse.json({
    kpis: {
      revenue_month: Math.round(sum((monthRes.data ?? []) as { paid_amount?: number }[]) * 100) / 100,
      revenue_year: Math.round(sum((yearRes.data ?? []) as { paid_amount?: number }[]) * 100) / 100,
      pending_quotes: quotesRes.data?.length ?? 0,
      pending_quotes_amount: Math.round(sumTtc(quotesRes.data ?? []) * 100) / 100,
      unpaid_invoices: unpaidRes.data?.length ?? 0,
      unpaid_invoices_amount: Math.round(remaining(unpaidRes.data ?? []) * 100) / 100,
      active_missions: missionsRes.count ?? 0,
      overdue_invoices: overdueRes.data?.length ?? 0,
      overdue_amount: Math.round(remaining(overdueRes.data ?? []) * 100) / 100,
      total_clients: clientsRes.count ?? 0,
      collection_rate: Math.round(collectionRate * 10) / 10,
    },
    chartData,
    recentInvoices,
    currency,
    market,
    year,
  });
}

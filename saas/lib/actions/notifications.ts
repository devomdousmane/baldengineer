"use server";

import { createClient } from "@/lib/supabase/server";

export interface AppNotification {
  id: string;
  type: "overdue" | "expiring" | "unpaid" | "info";
  title: string;
  description: string;
  href: string;
  date: string;
}

export async function getNotificationsAction(): Promise<AppNotification[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const today = new Date().toISOString().slice(0, 10);
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [overdueRes, expiringRes, unpaidRes] = await Promise.all([
    /* Overdue invoices */
    supabase
      .from("invoices")
      .select("id, number, client:clients(name), total_ttc, currency, due_date")
      .eq("user_id", auth.user.id)
      .eq("status", "overdue")
      .order("due_date", { ascending: true })
      .limit(5),

    /* Quotes expiring soon (sent, valid_until in next 7 days) */
    supabase
      .from("quotes")
      .select("id, number, client:clients(name), valid_until")
      .eq("user_id", auth.user.id)
      .eq("status", "sent")
      .gte("valid_until", today)
      .lte("valid_until", in7days)
      .order("valid_until", { ascending: true })
      .limit(5),

    /* Sent invoices past due date that aren't overdue yet */
    supabase
      .from("invoices")
      .select("id, number, client:clients(name), total_ttc, currency, due_date")
      .eq("user_id", auth.user.id)
      .eq("status", "sent")
      .lt("due_date", today)
      .order("due_date", { ascending: true })
      .limit(3),
  ]);

  const notifications: AppNotification[] = [];

  for (const inv of overdueRes.data ?? []) {
    const client = Array.isArray(inv.client) ? inv.client[0] : inv.client;
    const daysLate = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000);
    notifications.push({
      id: `overdue-${inv.id}`,
      type: "overdue",
      title: `Facture en retard — ${inv.number}`,
      description: `${client?.name ?? "Client"} · en retard de ${daysLate}j`,
      href: `/factures/${inv.id}`,
      date: inv.due_date,
    });
  }

  for (const q of expiringRes.data ?? []) {
    const client = Array.isArray(q.client) ? q.client[0] : q.client;
    const daysLeft = Math.ceil((new Date(q.valid_until).getTime() - Date.now()) / 86400000);
    notifications.push({
      id: `expiring-${q.id}`,
      type: "expiring",
      title: `Devis expirant — ${q.number}`,
      description: `${client?.name ?? "Client"} · expire dans ${daysLeft}j`,
      href: `/devis/${q.id}`,
      date: q.valid_until,
    });
  }

  for (const inv of unpaidRes.data ?? []) {
    const client = Array.isArray(inv.client) ? inv.client[0] : inv.client;
    const daysLate = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000);
    notifications.push({
      id: `unpaid-${inv.id}`,
      type: "unpaid",
      title: `Facture impayée — ${inv.number}`,
      description: `${client?.name ?? "Client"} · échéance dépassée de ${daysLate}j`,
      href: `/factures/${inv.id}`,
      date: inv.due_date,
    });
  }

  return notifications;
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceUserId } from "@/lib/workspace";

const TODAY = new Date().toISOString().slice(0, 10);
const d = (offset: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().slice(0, 10);
};

export async function seedDemoDataAction(): Promise<{ inserted: number }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  const userId = await getWorkspaceUserId(supabase, auth.user.id);

  /* ─── FRANCE clients ─── */
  const { data: clientsFR, error: cfrErr } = await supabase.from("clients").insert([
    {
      user_id: userId, market: "france", type: "company",
      name: "Sanofi SA", email: "achat@sanofi.fr", phone: "01 53 77 40 00",
      address: "54 rue La Boétie", city: "Paris", zip: "75008", country: "France",
      siren: "395 030 844", vat_number: "FR40395030844",
    },
    {
      user_id: userId, market: "france", type: "company",
      name: "Total Énergies SE", email: "procurement@total.com", phone: "01 47 44 45 46",
      address: "2 place Jean Millier", city: "Puteaux", zip: "92400", country: "France",
      siren: "542 051 180", vat_number: "FR54542051180",
    },
    {
      user_id: userId, market: "france", type: "individual",
      name: "Marie Lefebvre", email: "marie.lefebvre@gmail.com", phone: "06 12 34 56 78",
      address: "12 avenue Montaigne", city: "Lyon", zip: "69002", country: "France",
    },
  ]).select("id, name");
  if (cfrErr) throw new Error(cfrErr.message);

  /* ─── GUINÉE clients ─── */
  const { data: clientsGN, error: cgnErr } = await supabase.from("clients").insert([
    {
      user_id: userId, market: "guinee", type: "company",
      name: "CBG Boké", email: "direction@cbg.gn", phone: "+224 621 00 11 22",
      address: "Rue Kouyaté", city: "Conakry", zip: "", country: "Guinée",
      nif: "GN123456789",
    },
    {
      user_id: userId, market: "guinee", type: "company",
      name: "Simfer SA", email: "contact@simfer.gn", phone: "+224 655 44 33 22",
      address: "Avenue de la République", city: "Conakry", zip: "", country: "Guinée",
      nif: "GN987654321",
    },
    {
      user_id: userId, market: "guinee", type: "individual",
      name: "Ibrahima Diallo", email: "ibrahima.diallo@gmail.com", phone: "+224 620 99 88 77",
      address: "Quartier Kaloum", city: "Conakry", zip: "", country: "Guinée",
    },
  ]).select("id, name");
  if (cgnErr) throw new Error(cgnErr.message);

  const [sanofi, total, marie] = clientsFR!;
  const [cbg, simfer] = clientsGN!;

  /* ─── Profile for counters & prefixes ─── */
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", userId).single();
  if (!profile) throw new Error("Profil introuvable");

  let qcFR = profile.quote_counter_fr as number;
  let qcGN = profile.quote_counter_gn as number;
  let icFR = profile.invoice_counter_fr as number;
  let icGN = profile.invoice_counter_gn as number;

  const qnFR = () => `${profile.quote_prefix_fr}${String(qcFR++).padStart(4, "0")}`;
  const qnGN = () => `${profile.quote_prefix_gn}${String(qcGN++).padStart(4, "0")}`;
  const inFR = () => `${profile.invoice_prefix_fr}${String(icFR++).padStart(4, "0")}`;
  const inGN = () => `${profile.invoice_prefix_gn}${String(icGN++).padStart(4, "0")}`;

  /* ─── FRANCE quotes ─── */
  const quotesFR = [
    { user_id: userId, client_id: sanofi.id, market: "france", number: qnFR(), title: "Audit CFO Installation HVAC — Site Vitry", status: "accepted", date: d(-30), valid_until: d(30), currency: "EUR", subtotal_ht: 12000, total_vat: 2400, total_ttc: 14400, accepted_at: d(-20), notes: "Mission en régie 20j × 600€/j" },
    { user_id: userId, client_id: total.id, market: "france", number: qnFR(), title: "Ingénierie process — Raffinerie Gonfreville", status: "sent", date: d(-10), valid_until: d(20), currency: "EUR", subtotal_ht: 9000, total_vat: 1800, total_ttc: 10800, sent_at: d(-10) },
    { user_id: userId, client_id: marie.id, market: "france", number: qnFR(), title: "Consultation technique énergie renouvelable", status: "draft", date: TODAY, valid_until: d(45), currency: "EUR", subtotal_ht: 3500, total_vat: 700, total_ttc: 4200 },
  ];

  const { data: qFR, error: qfrErr } = await supabase.from("quotes").insert(quotesFR).select("id");
  if (qfrErr) throw new Error(qfrErr.message);

  /* ─── GUINÉE quotes ─── */
  const quotesGN = [
    { user_id: userId, client_id: cbg.id, market: "guinee", number: qnGN(), title: "Mission CFO — Mine de bauxite Boké", status: "accepted", date: d(-45), valid_until: d(-5), currency: "GNF", subtotal_ht: 180_000_000, total_vat: 0, total_ttc: 180_000_000, accepted_at: d(-40) },
    { user_id: userId, client_id: simfer.id, market: "guinee", number: qnGN(), title: "Conception ventilation industrielle", status: "sent", date: d(-15), valid_until: d(15), currency: "GNF", subtotal_ht: 95_000_000, total_vat: 0, total_ttc: 95_000_000, sent_at: d(-15) },
  ];

  const { data: qGN, error: qgnErr } = await supabase.from("quotes").insert(quotesGN).select("id");
  if (qgnErr) throw new Error(qgnErr.message);

  /* ─── FRANCE invoices ─── */
  const invoicesFR = [
    {
      user_id: userId, client_id: sanofi.id, quote_id: qFR![0].id,
      market: "france", number: inFR(), title: "Audit CFO HVAC — Site Vitry — Phase 1",
      status: "paid", date: d(-28), due_date: d(2), currency: "EUR",
      subtotal_ht: 12000, total_vat: 2400, total_ttc: 14400,
      paid_amount: 14400, payment_method: "virement",
      paid_at: d(-5), sent_at: d(-25),
    },
    {
      user_id: userId, client_id: total.id,
      market: "france", number: inFR(), title: "Prestation ingénierie — Étude préliminaire",
      status: "sent", date: d(-20), due_date: d(10), currency: "EUR",
      subtotal_ht: 4500, total_vat: 900, total_ttc: 5400,
      paid_amount: 0, sent_at: d(-20),
    },
    {
      user_id: userId, client_id: sanofi.id,
      market: "france", number: inFR(), title: "Audit CFO HVAC — Phase 2 (Bilan thermique)",
      status: "overdue", date: d(-60), due_date: d(-30), currency: "EUR",
      subtotal_ht: 8000, total_vat: 1600, total_ttc: 9600,
      paid_amount: 0, sent_at: d(-58),
    },
    {
      user_id: userId, client_id: marie.id,
      market: "france", number: inFR(), title: "Consultation — Bilan énergétique résidentiel",
      status: "partial", date: d(-15), due_date: d(15), currency: "EUR",
      subtotal_ht: 2000, total_vat: 400, total_ttc: 2400,
      paid_amount: 1200, payment_method: "virement", sent_at: d(-15),
    },
  ];

  const { data: iFR, error: ifrErr } = await supabase.from("invoices").insert(invoicesFR).select("id");
  if (ifrErr) throw new Error(ifrErr.message);

  /* ─── GUINÉE invoices ─── */
  const invoicesGN = [
    {
      user_id: userId, client_id: cbg.id, quote_id: qGN![0].id,
      market: "guinee", number: inGN(), title: "Mission CFO Boké — Acompte 50%",
      status: "paid", date: d(-42), due_date: d(-12), currency: "GNF",
      subtotal_ht: 90_000_000, total_vat: 0, total_ttc: 90_000_000,
      paid_amount: 90_000_000, payment_method: "virement",
      paid_at: d(-30), sent_at: d(-40),
    },
    {
      user_id: userId, client_id: simfer.id,
      market: "guinee", number: inGN(), title: "Étude ventilation industrielle — Livrable 1",
      status: "sent", date: d(-12), due_date: d(18), currency: "GNF",
      subtotal_ht: 50_000_000, total_vat: 0, total_ttc: 50_000_000,
      paid_amount: 0, sent_at: d(-12),
    },
  ];

  const { data: iGN, error: ignErr } = await supabase.from("invoices").insert(invoicesGN).select("id");
  if (ignErr) throw new Error(ignErr.message);

  /* ─── Quote lines (FR) ─── */
  const { error: qlFrErr } = await supabase.from("quote_lines").insert([
    { quote_id: qFR![0].id, position: 1, description: "Audit thermique et aéraulique", quantity: 10, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { quote_id: qFR![0].id, position: 2, description: "Rapport d'ingénierie CFO", quantity: 5, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { quote_id: qFR![0].id, position: 3, description: "Réunion de restitution", quantity: 5, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { quote_id: qFR![1].id, position: 1, description: "Ingénierie process raffinerie", quantity: 15, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { quote_id: qFR![2].id, position: 1, description: "Consultation énergie renouvelable", quantity: 5, unit: "j", unit_price: 700, vat_rate: 20, discount_pct: 0 },
  ]);
  if (qlFrErr) throw new Error(qlFrErr.message);

  /* ─── Quote lines (GN) ─── */
  const { error: qlGnErr } = await supabase.from("quote_lines").insert([
    { quote_id: qGN![0].id, position: 1, description: "Mission CFO mine de bauxite", quantity: 200, unit: "j", unit_price: 900_000, vat_rate: 0, discount_pct: 0 },
    { quote_id: qGN![1].id, position: 1, description: "Conception ventilation industrielle", quantity: 127, unit: "j", unit_price: 750_000, vat_rate: 0, discount_pct: 0 },
  ]);
  if (qlGnErr) throw new Error(qlGnErr.message);

  /* ─── Invoice lines (FR) ─── */
  const { error: ilFrErr } = await supabase.from("invoice_lines").insert([
    { invoice_id: iFR![0].id, position: 1, description: "Audit thermique et aéraulique", quantity: 10, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { invoice_id: iFR![0].id, position: 2, description: "Rapport CFO", quantity: 5, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { invoice_id: iFR![0].id, position: 3, description: "Réunion restitution", quantity: 5, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { invoice_id: iFR![1].id, position: 1, description: "Étude préliminaire ingénierie", quantity: 7.5, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { invoice_id: iFR![2].id, position: 1, description: "Bilan thermique installation", quantity: 13.33, unit: "j", unit_price: 600, vat_rate: 20, discount_pct: 0 },
    { invoice_id: iFR![3].id, position: 1, description: "Bilan énergétique résidentiel", quantity: 4, unit: "j", unit_price: 500, vat_rate: 20, discount_pct: 0 },
  ]);
  if (ilFrErr) throw new Error(ilFrErr.message);

  /* ─── Invoice lines (GN) ─── */
  const { error: ilGnErr } = await supabase.from("invoice_lines").insert([
    { invoice_id: iGN![0].id, position: 1, description: "Mission CFO Boké — acompte 50%", quantity: 100, unit: "j", unit_price: 900_000, vat_rate: 0, discount_pct: 0 },
    { invoice_id: iGN![1].id, position: 1, description: "Étude ventilation industrielle — livrable 1", quantity: 66.67, unit: "j", unit_price: 750_000, vat_rate: 0, discount_pct: 0 },
  ]);
  if (ilGnErr) throw new Error(ilGnErr.message);

  /* ─── Missions ─── */
  await supabase.from("missions").insert([
    { user_id: userId, client_id: sanofi.id, market: "france", title: "Audit CFO HVAC — Site Vitry", status: "completed", start_date: d(-60), end_date: d(-20), daily_rate: 600, estimated_days: 20, currency: "EUR", description: "Audit complet de l'installation de refroidissement froids" },
    { user_id: userId, client_id: total.id, market: "france", title: "Ingénierie process Gonfreville", status: "active", start_date: d(-10), daily_rate: 650, estimated_days: 15, currency: "EUR" },
    { user_id: userId, client_id: cbg.id, market: "guinee", title: "Mission CFO Mine Boké", status: "active", start_date: d(-45), daily_rate: 900_000, estimated_days: 30, currency: "GNF" },
    { user_id: userId, client_id: simfer.id, market: "guinee", title: "Ventilation industrielle Simfer", status: "pending", start_date: d(5), daily_rate: 750_000, estimated_days: 20, currency: "GNF" },
  ]);

  /* ─── Accounting entries ─── */
  await supabase.from("accounting_entries").insert([
    { user_id: userId, market: "france", type: "income", category: "facturation", label: "Paiement FAC-FR — Sanofi Phase 1", amount: 14400, currency: "EUR", date: d(-5) },
    { user_id: userId, market: "france", type: "expense", category: "deplacement", label: "Train Paris–Vitry (aller-retour)", amount: 87.60, currency: "EUR", date: d(-25) },
    { user_id: userId, market: "france", type: "expense", category: "logiciels", label: "Abonnement AutoCAD MEP", amount: 290, currency: "EUR", date: d(-15) },
    { user_id: userId, market: "france", type: "expense", category: "assurance", label: "RC Pro annuelle", amount: 1200, currency: "EUR", date: d(-90) },
    { user_id: userId, market: "guinee", type: "income", category: "facturation", label: "Acompte CBG Boké 50%", amount: 90_000_000, currency: "GNF", date: d(-30) },
    { user_id: userId, market: "guinee", type: "expense", category: "deplacement", label: "Vol Conakry–Boké", amount: 2_500_000, currency: "GNF", date: d(-42) },
  ]);

  /* ─── Update profile counters ─── */
  await supabase.from("profiles").update({
    quote_counter_fr: qcFR,
    quote_counter_gn: qcGN,
    invoice_counter_fr: icFR,
    invoice_counter_gn: icGN,
  }).eq("id", userId);

  revalidatePath("/", "layout");

  return { inserted: 6 + 5 + 6 + 4 + 4 + 6 };
}

/**
 * Supprime TOUTES les données métier du workspace partagé (clients, devis, factures,
 * missions, écritures comptables) — pas seulement celles du compte qui déclenche
 * l'action. Il n'existe pas de distinction "démo" vs "réel" en base : dans un espace
 * de travail partagé entre plusieurs comptes, ce bouton est donc irréversible et
 * dangereux — l'appelant (UI) doit imposer une confirmation explicite et sans
 * ambiguïté avant d'invoquer cette action.
 */
export async function deleteDemoDataAction(): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Non authentifié");

  /* quotes.converted_to_invoice_id référence invoices(id) sans ON DELETE CASCADE
     (contrainte fk_quotes_invoice) — supprimer une facture convertie échouerait
     silencieusement si ce lien n'est pas cassé d'abord. */
  const { error: unlinkErr } = await supabase
    .from("quotes").update({ converted_to_invoice_id: null }).not("id", "is", null);
  if (unlinkErr) throw new Error(unlinkErr.message);

  /* Delete in order to respect FK constraints — chaque erreur est vérifiée pour ne
     jamais laisser croire à une suppression totale en cas d'échec partiel. */
  const steps: [string, string][] = [
    ["accounting_entries", "les écritures comptables"],
    ["invoice_lines", "les lignes de facture"],
    ["invoices", "les factures"],
    ["quote_lines", "les lignes de devis"],
    ["quotes", "les devis"],
    ["missions", "les missions"],
    ["clients", "les clients"],
  ];
  for (const [table, label] of steps) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) throw new Error(`Échec de la suppression pour ${label} : ${error.message}`);
  }

  revalidatePath("/", "layout");
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCiiXml } from "@/lib/facturx/generate-xml";
import { generatePdf } from "@/lib/facturx/generate-pdf";
import { embedFacturX } from "@/lib/facturx/embed";
import { auditLog } from "@/lib/audit";
import { getWorkspaceProfile } from "@/lib/workspace";
import type { FacturXData, FacturXLine } from "@/lib/facturx/types";
import type { InvoiceLine, Profile } from "@/types/database";

/* ?format=xml  → télécharge le XML seul
   ?format=pdf  → télécharge le PDF hybride Factur-X (défaut) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(_req.url);
  const format = searchParams.get("format") ?? "pdf";

  /* Auth */
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Non autorisé", { status: 401 });

  /* Facture + lignes + client */
  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("*, client:clients(*), lines:invoice_lines(*)")
    .eq("id", id)
    .order("position", { referencedTable: "invoice_lines" })
    .single();

  if (invErr || !invoice) return new NextResponse("Facture introuvable", { status: 404 });
  if (invoice.market !== "france") {
    return new NextResponse("Factur-X s'applique uniquement au marché France", { status: 400 });
  }

  /* Profil vendeur */
  const p = await getWorkspaceProfile(supabase, user.id) as Profile | null;
  const client = invoice.client as { name: string; address?: string | null; city?: string | null; zip?: string | null; country?: string; vat_number?: string | null; siren?: string | null } | null;

  const lines: FacturXLine[] = (invoice.lines as InvoiceLine[]).map((l) => ({
    position: l.position,
    description: l.description,
    quantity: l.quantity,
    unit: l.unit,
    unit_price: l.unit_price,
    vat_rate: l.vat_rate,
    discount_pct: l.discount_pct,
    total_ht: l.total_ht,
  }));

  const data: FacturXData = {
    invoice: {
      number: invoice.number,
      date: invoice.date,
      due_date: invoice.due_date,
      currency: invoice.currency,
      notes: invoice.notes,
      subtotal_ht: invoice.subtotal_ht,
      total_vat: invoice.total_vat,
      total_ttc: invoice.total_ttc,
      paid_amount: invoice.paid_amount,
      lines,
    },
    seller: {
      name: p?.company_name ?? "BaldEngineer",
      address: p?.company_address ?? null,
      city: p?.company_city ?? null,
      zip: p?.company_zip ?? null,
      country: p?.company_country ?? "FR",
      vat_number: p?.vat_number ?? null,
      siren: p?.company_siren ?? null,
      email: p?.company_email ?? null,
      iban: p?.bank_iban ?? null,
      bic: p?.bank_bic ?? null,
      bank_name: p?.bank_name ?? null,
    },
    buyer: {
      name: client?.name ?? "Client",
      address: client?.address ?? null,
      city: client?.city ?? null,
      zip: client?.zip ?? null,
      country: client?.country ?? "FR",
      vat_number: client?.vat_number ?? null,
      siren: client?.siren ?? null,
    },
  };

  /* ── Format XML seul ── */
  if (format === "xml") {
    const xml = generateCiiXml(data);
    auditLog({ action: "facturx.generated", user_id: user.id, resource_id: id, resource_type: "invoice", metadata: { format: "xml" } });
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Content-Disposition": `attachment; filename="factur-x_${invoice.number}.xml"`,
      },
    });
  }

  /* ── Format PDF hybride ── */
  try {
    const xml = generateCiiXml(data);
    const pdfBytes = await generatePdf(data);
    const hybrid = await embedFacturX(pdfBytes, Buffer.from(xml, "utf-8"));

    auditLog({ action: "facturx.generated", user_id: user.id, resource_id: id, resource_type: "invoice", metadata: { format: "pdf" } });
    return new NextResponse(Buffer.from(hybrid), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="factur-x_${invoice.number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[facturx] PDF generation failed:", err);
    /* Fallback : retourne le XML si Puppeteer échoue */
    const xml = generateCiiXml(data);
    auditLog({ action: "facturx.generated", user_id: user.id, resource_id: id, resource_type: "invoice", metadata: { format: "xml-fallback" } });
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Content-Disposition": `attachment; filename="factur-x_${invoice.number}.xml"`,
        "X-Facturx-Fallback": "xml-only",
      },
    });
  }
}

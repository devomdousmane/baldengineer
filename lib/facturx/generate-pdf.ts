import type { FacturXData } from "./types";

/** Échappe le HTML pour tout champ provenant de l'utilisateur (client, profil, lignes). */
function esc(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function fmt(n: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

function buildHtml(data: FacturXData): string {
  const { invoice, seller, buyer } = data;
  const currency = invoice.currency;

  const linesHtml = invoice.lines.map((l) => {
    const ht = Math.round(l.quantity * l.unit_price * (1 - l.discount_pct / 100) * 100) / 100;
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;color:#475569;font-size:11px;">${l.position}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;">${esc(l.description)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:center;">${esc(l.quantity)} ${esc(l.unit)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:right;">${fmt(l.unit_price, currency)}</td>
        ${l.discount_pct > 0 ? `<td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:right;color:#D97706;">-${l.discount_pct}%</td>` : ""}
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:right;">${l.vat_rate}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:600;">${fmt(ht, currency)}</td>
      </tr>`;
  }).join("");

  const hasDiscount = invoice.lines.some((l) => l.discount_pct > 0);
  const remaining = Math.max(0, invoice.total_ttc - invoice.paid_amount);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Facture ${esc(invoice.number)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; font-size: 12px; color: #0F172A; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { padding: 40px 48px; max-width: 800px; margin: 0 auto; }
  .accent-bar { height: 4px; background: linear-gradient(to right, #0369A1, #0EA5E9); border-radius: 2px; margin-bottom: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .seller-name { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 2px; }
  .seller-info { color: #475569; font-size: 11px; line-height: 1.6; }
  .badge-block { text-align: right; }
  .doc-type { font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.5px; }
  .doc-number { font-family: monospace; font-size: 13px; color: #0369A1; font-weight: 600; margin-top: 2px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; }
  .card-title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #94A3B8; margin-bottom: 6px; }
  .card-name { font-size: 13px; font-weight: 600; color: #0F172A; margin-bottom: 3px; }
  .card-body { font-size: 11px; color: #475569; line-height: 1.6; }
  .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
  .date-item { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; }
  .date-label { font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .date-value { font-size: 12px; font-weight: 600; color: #0F172A; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead tr { background: #F8FAFC; }
  th { padding: 9px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E2E8F0; }
  th.right { text-align: right; }
  th.center { text-align: center; }
  tbody tr:nth-child(even) { background: #FAFAFA; }
  .totals { margin-left: auto; width: 220px; margin-bottom: 24px; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #475569; }
  .totals-row.main { border-top: 2px solid #E2E8F0; margin-top: 4px; padding-top: 10px; font-weight: 700; font-size: 13px; color: #0F172A; background: #EFF6FF; padding: 8px 10px; border-radius: 6px; }
  .totals-row.main span:last-child { color: #0369A1; }
  .iban-box { background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; }
  .iban-title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #0369A1; margin-bottom: 6px; }
  .iban-val { font-family: monospace; font-size: 12px; color: #0369A1; font-weight: 500; }
  .notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .notes-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px 14px; }
  .notes-title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8; margin-bottom: 6px; }
  .notes-body { font-size: 11px; color: #475569; white-space: pre-wrap; line-height: 1.6; }
  footer { border-top: 1px solid #E2E8F0; padding-top: 14px; font-size: 10px; color: #94A3B8; text-align: center; }
  .facturx-badge { display:inline-block; background:#EFF6FF; color:#0369A1; border:1px solid #BAE6FD; border-radius:4px; padding:2px 8px; font-size:10px; font-weight:600; margin-top:4px; }
</style>
</head>
<body>
<div class="page">
  <div class="accent-bar"></div>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="seller-name">${esc(seller.name)}</div>
      <div class="seller-info">
        ${[esc(seller.address), esc([seller.zip, seller.city].filter(Boolean).join(" ")), seller.country !== "FR" ? esc(seller.country) : "France"].filter(Boolean).join("<br>")}
        ${seller.vat_number ? `<br>N° TVA : ${esc(seller.vat_number)}` : ""}
        ${seller.siren ? `<br>SIREN : ${esc(seller.siren)}` : ""}
        ${seller.email ? `<br>${esc(seller.email)}` : ""}
      </div>
    </div>
    <div class="badge-block">
      <div class="doc-type">FACTURE</div>
      <div class="doc-number">${esc(invoice.number)}</div>
      <div><span class="facturx-badge">Factur-X EN 16931</span></div>
    </div>
  </div>

  <!-- Parties + Dates -->
  <div class="grid-2">
    <div class="card">
      <div class="card-title">Émis par</div>
      <div class="card-name">${esc(seller.name)}</div>
      <div class="card-body">
        ${esc(seller.address) || ""}${seller.city ? `<br>${esc([seller.zip, seller.city].filter(Boolean).join(" "))}` : ""}
      </div>
    </div>
    <div class="card">
      <div class="card-title">Facturé à</div>
      <div class="card-name">${esc(buyer.name)}</div>
      <div class="card-body">
        ${esc(buyer.address) || ""}${buyer.city ? `<br>${esc([buyer.zip, buyer.city].filter(Boolean).join(" "))}` : ""}
        ${buyer.vat_number ? `<br>N° TVA : ${esc(buyer.vat_number)}` : ""}
        ${buyer.siren ? `<br>SIREN : ${esc(buyer.siren)}` : ""}
      </div>
    </div>
  </div>

  <div class="dates-grid">
    <div class="date-item">
      <div class="date-label">Date de facturation</div>
      <div class="date-value">${fmtDate(invoice.date)}</div>
    </div>
    <div class="date-item">
      <div class="date-label">Date d'échéance</div>
      <div class="date-value">${fmtDate(invoice.due_date)}</div>
    </div>
  </div>

  <!-- Lines table -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th class="center">Qté / Unité</th>
        <th class="right">P.U. HT</th>
        ${hasDiscount ? "<th class=\"right\">Remise</th>" : ""}
        <th class="right">TVA</th>
        <th class="right">Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${linesHtml}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-row"><span>Sous-total HT</span><span>${fmt(invoice.subtotal_ht, currency)}</span></div>
    <div class="totals-row"><span>TVA</span><span>${fmt(invoice.total_vat, currency)}</span></div>
    <div class="totals-row main"><span>Total TTC</span><span>${fmt(invoice.total_ttc, currency)}</span></div>
    ${invoice.paid_amount > 0 ? `
    <div class="totals-row" style="color:#059669;"><span>Déjà réglé</span><span>-${fmt(invoice.paid_amount, currency)}</span></div>
    <div class="totals-row" style="font-weight:700;color:${remaining > 0 ? "#DC2626" : "#059669"};">
      <span>Reste à payer</span><span>${fmt(remaining, currency)}</span>
    </div>` : ""}
  </div>

  <!-- IBAN -->
  ${seller.iban ? `
  <div class="iban-box">
    <div class="iban-title">Coordonnées bancaires — Virement SEPA</div>
    ${seller.bank_name ? `<div style="font-size:11px;color:#475569;margin-bottom:4px;">${esc(seller.bank_name)}</div>` : ""}
    <div class="iban-val">${esc(seller.iban)}</div>
    ${seller.bic ? `<div style="font-size:11px;color:#0369A1;margin-top:2px;">BIC : ${esc(seller.bic)}</div>` : ""}
  </div>` : ""}

  <!-- Notes -->
  ${invoice.notes ? `
  <div class="notes-grid">
    <div class="notes-box">
      <div class="notes-title">Notes</div>
      <div class="notes-body">${esc(invoice.notes)}</div>
    </div>
  </div>` : ""}

  <footer>
    ${esc(seller.name)} · ${seller.siren ? `SIREN ${esc(seller.siren)} · ` : ""}${seller.vat_number ? `TVA ${esc(seller.vat_number)} · ` : ""}Facture n° ${esc(invoice.number)} · ${fmtDate(invoice.date)}
    <br>Document conforme au standard Factur-X EN 16931
  </footer>
</div>
</body>
</html>`;
}

/**
 * En local (npm run dev / build classique) on utilise puppeteer complet,
 * qui embarque son propre Chromium. En production sur Netlify Functions,
 * ce Chromium dépasse la limite de taille du bundle : on bascule alors sur
 * puppeteer-core + @sparticuz/chromium (binaire compressé, serverless-friendly).
 */
async function launchBrowser() {
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const [{ default: chromium }, { default: puppeteerCore }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);
    return puppeteerCore.launch({
      headless: true,
      args: chromium.args,
      executablePath: await chromium.executablePath(),
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

export async function generatePdf(data: FacturXData): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    /* Défense en profondeur : le HTML est échappé (esc()), mais on désactive
       aussi l'exécution JS puisque le contenu n'en a jamais besoin. */
    await page.setJavaScriptEnabled(false);
    await page.setContent(buildHtml(data), { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

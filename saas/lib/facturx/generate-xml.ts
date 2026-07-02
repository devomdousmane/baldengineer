import type { FacturXData } from "./types";

/* ── Helpers ──────────────────────────────────────────────────── */

function x(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function fmtDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, "");
}

function fmtAmt(n: number): string {
  return n.toFixed(2);
}

/* Maps our shorthand units to UN/CEFACT unit codes (Rec 20) */
function unitCode(unit: string): string {
  const map: Record<string, string> = {
    j: "DAY", jour: "DAY", jours: "DAY", day: "DAY", days: "DAY",
    h: "HUR", heure: "HUR", heures: "HUR", hr: "HUR", hour: "HUR",
    m: "MON", mois: "MON", month: "MON",
    sem: "WEE", semaine: "WEE", week: "WEE",
    km: "KMT", kg: "KGM", t: "TNE", l: "LTR",
    u: "C62", unit: "C62", unité: "C62", pièce: "C62", pc: "C62",
    p: "C62", lot: "C62",
  };
  return map[unit.toLowerCase().trim()] ?? "C62";
}

/* EN 16931 VAT category code */
function vatCategory(rate: number): string {
  return rate > 0 ? "S" : "Z";
}

/* Group lines by VAT rate for header-level tax breakdown */
interface VatGroup {
  rate: number;
  baseAmount: number;
  vatAmount: number;
}

function groupByVat(lines: FacturXData["invoice"]["lines"]): VatGroup[] {
  const map = new Map<number, VatGroup>();
  for (const l of lines) {
    const existing = map.get(l.vat_rate);
    const vatAmt = Math.round(l.total_ht * l.vat_rate / 100 * 100) / 100;
    if (existing) {
      existing.baseAmount = Math.round((existing.baseAmount + l.total_ht) * 100) / 100;
      existing.vatAmount = Math.round((existing.vatAmount + vatAmt) * 100) / 100;
    } else {
      map.set(l.vat_rate, { rate: l.vat_rate, baseAmount: l.total_ht, vatAmount: vatAmt });
    }
  }
  return Array.from(map.values());
}

/* ── Main generator ───────────────────────────────────────────── */

export function generateCiiXml(data: FacturXData): string {
  const { invoice, seller, buyer } = data;
  const vatGroups = groupByVat(invoice.lines);
  const remaining = Math.max(0, Math.round((invoice.total_ttc - invoice.paid_amount) * 100) / 100);

  const lines = invoice.lines.map((l) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${l.position}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${x(l.description)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${fmtAmt(l.unit_price * (1 - l.discount_pct / 100))}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="${unitCode(l.unit)}">${l.quantity}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${vatCategory(l.vat_rate)}</ram:CategoryCode>
          <ram:RateApplicablePercent>${fmtAmt(l.vat_rate)}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${fmtAmt(l.total_ht)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`).join("\n");

  const taxBreakdown = vatGroups.map((g) => `
    <ram:ApplicableTradeTax>
      <ram:CalculatedAmount>${fmtAmt(g.vatAmount)}</ram:CalculatedAmount>
      <ram:TypeCode>VAT</ram:TypeCode>
      <ram:BasisAmount>${fmtAmt(g.baseAmount)}</ram:BasisAmount>
      <ram:CategoryCode>${vatCategory(g.rate)}</ram:CategoryCode>
      <ram:RateApplicablePercent>${fmtAmt(g.rate)}</ram:RateApplicablePercent>
    </ram:ApplicableTradeTax>`).join("\n");

  const paymentMeans = seller.iban ? `
    <ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:TypeCode>58</ram:TypeCode>
      <ram:PayeePartyCreditorFinancialAccount>
        <ram:IBANID>${seller.iban.replace(/\s/g, "")}</ram:IBANID>
      </ram:PayeePartyCreditorFinancialAccount>${seller.bic ? `
      <ram:PayeeSpecifiedCreditorFinancialInstitution>
        <ram:BICID>${x(seller.bic)}</ram:BICID>
      </ram:PayeeSpecifiedCreditorFinancialInstitution>` : ""}
    </ram:SpecifiedTradeSettlementPaymentMeans>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <!-- BT-24 : Profil Factur-X EN 16931 -->
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:en16931</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>

  <!-- BT-1 Numéro · BT-3 Type · BT-2 Date -->
  <rsm:ExchangedDocument>
    <ram:ID>${x(invoice.number)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${fmtDate(invoice.date)}</udt:DateTimeString>
    </ram:IssueDateTime>${invoice.notes ? `
    <ram:IncludedNote>
      <ram:Content>${x(invoice.notes)}</ram:Content>
    </ram:IncludedNote>` : ""}
  </rsm:ExchangedDocument>

  <rsm:SupplyChainTradeTransaction>
    <!-- ── Lignes de facturation (BG-25) ── -->
${lines}

    <!-- ── Accord commercial : vendeur / acheteur (BG-4, BG-7) ── -->
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${x(seller.name)}</ram:Name>${seller.siren ? `
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${x(seller.siren)}</ram:ID>
        </ram:SpecifiedLegalOrganization>` : ""}
        <ram:PostalTradeAddress>${seller.address ? `
          <ram:LineOne>${x(seller.address)}</ram:LineOne>` : ""}${seller.zip ? `
          <ram:PostcodeCode>${x(seller.zip)}</ram:PostcodeCode>` : ""}${seller.city ? `
          <ram:CityName>${x(seller.city)}</ram:CityName>` : ""}
          <ram:CountryID>${seller.country || "FR"}</ram:CountryID>
        </ram:PostalTradeAddress>${seller.email ? `
        <ram:URIUniversalCommunication>
          <ram:URIID schemeID="EM">${x(seller.email)}</ram:URIID>
        </ram:URIUniversalCommunication>` : ""}${seller.vat_number ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${x(seller.vat_number)}</ram:ID>
        </ram:SpecifiedTaxRegistration>` : ""}
      </ram:SellerTradeParty>

      <ram:BuyerTradeParty>
        <ram:Name>${x(buyer.name)}</ram:Name>${buyer.siren ? `
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${x(buyer.siren)}</ram:ID>
        </ram:SpecifiedLegalOrganization>` : ""}
        <ram:PostalTradeAddress>${buyer.address ? `
          <ram:LineOne>${x(buyer.address)}</ram:LineOne>` : ""}${buyer.zip ? `
          <ram:PostcodeCode>${x(buyer.zip)}</ram:PostcodeCode>` : ""}${buyer.city ? `
          <ram:CityName>${x(buyer.city)}</ram:CityName>` : ""}
          <ram:CountryID>${buyer.country || "FR"}</ram:CountryID>
        </ram:PostalTradeAddress>${buyer.vat_number ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${x(buyer.vat_number)}</ram:ID>
        </ram:SpecifiedTaxRegistration>` : ""}
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>

    <!-- ── Livraison (obligatoire, vide si non applicable) ── -->
    <ram:ApplicableHeaderTradeDelivery/>

    <!-- ── Règlement (BG-16) ── -->
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${invoice.currency}</ram:InvoiceCurrencyCode>
${paymentMeans}
${taxBreakdown}
      <!-- BT-9 : Échéance -->
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${fmtDate(invoice.due_date)}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>

      <!-- BG-22 : Totaux -->
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${fmtAmt(invoice.subtotal_ht)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${fmtAmt(invoice.subtotal_ht)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${invoice.currency}">${fmtAmt(invoice.total_vat)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${fmtAmt(invoice.total_ttc)}</ram:GrandTotalAmount>
        <ram:TotalPrepaidAmount>${fmtAmt(invoice.paid_amount)}</ram:TotalPrepaidAmount>
        <ram:DuePayableAmount>${fmtAmt(remaining)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

const BRAND = "#2D8A3E";
const BRAND_HI = "#4DB85C";

export interface EmailLayoutOptions {
  preheader?: string;    // Hidden preview text in inbox
  title: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyCity?: string;
  market?: "france" | "guinee";
}

/* Wraps content HTML in the base BaldPro email layout */
export function layout(content: string, opts: EmailLayoutOptions): string {
  const { preheader = "", title, companyName = "BaldPro", companyEmail, companyPhone, companyCity, market } = opts;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body, table, td { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; }
    img { border:0; display:block; }
    a { color:${BRAND}; text-decoration:none; }
    @media only screen and (max-width:600px) {
      .container { width:100%!important; }
      .content-pad { padding:24px 16px!important; }
      .hide-mobile { display:none!important; }
    }
  </style>
</head>
<body style="background:#F1F5F9; margin:0; padding:0; -webkit-text-size-adjust:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#F1F5F9;">${preheader}</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1F5F9;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Container -->
        <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${BRAND},${BRAND_HI});font-size:0;">&nbsp;</td>
          </tr>

          <!-- Logo + company -->
          <tr>
            <td style="padding:24px 40px 20px;border-bottom:1px solid #F1F5F9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:800;color:${BRAND};letter-spacing:-0.5px;">BaldPro</span>
                    ${market ? `<span style="display:inline-block;margin-left:8px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;background:${market === "france" ? "#EFF6FF" : "#FEF2F2"};color:${market === "france" ? "#1D4ED8" : "#DC2626"};">${market === "france" ? "🇫🇷 France" : "🇬🇳 Guinée"}</span>` : ""}
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#94A3B8;">${companyName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td class="content-pad" style="padding:32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:11px;color:#94A3B8;line-height:1.6;">
                Cet email a été envoyé par <strong style="color:#64748B;">${companyName}</strong>
                via <strong style="color:${BRAND};">BaldPro</strong>.
                ${companyEmail ? `<br>Répondre à : <a href="mailto:${companyEmail}" style="color:${BRAND};">${companyEmail}</a>` : ""}
                ${companyPhone ? ` &nbsp;·&nbsp; ${companyPhone}` : ""}
                ${companyCity ? ` &nbsp;·&nbsp; ${companyCity}` : ""}
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#CBD5E1;">
                © ${year} BaldPro — Gestion d'activité professionnelle
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Reusable HTML building blocks ── */

export function heading(text: string, sub?: string): string {
  return `
    <h1 style="margin:0 0 ${sub ? "6px" : "20px"};font-size:22px;font-weight:700;color:#0F172A;letter-spacing:-0.3px;">${text}</h1>
    ${sub ? `<p style="margin:0 0 20px;font-size:14px;color:#64748B;">${sub}</p>` : ""}
  `;
}

export function para(text: string, muted = false): string {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:${muted ? "#64748B" : "#334155"};">${text}</p>`;
}

/**
 * Message client : si customMessage est fourni, il est déjà du HTML (converti
 * depuis markdown côté API) avec ses propres balises <p>/<ul>/etc. — on le
 * stylise via un wrapper plutôt que de l'imbriquer dans un second <p>.
 * Sinon on affiche le texte de secours via para().
 */
export function customMessageBlock(customMessage: string | null | undefined, fallback: string): string {
  if (!customMessage) return para(fallback);
  return `<div style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">${customMessage}</div>`;
}

export function highlightBox(label: string, value: string, accent = false): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr>
        <td style="padding:12px 16px;background:${accent ? "#F0FFF4" : "#F8FAFC"};border-radius:8px;border-left:3px solid ${accent ? BRAND : "#E2E8F0"};">
          <span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94A3B8;">${label}</span><br>
          <span style="font-size:15px;font-weight:700;color:${accent ? BRAND : "#0F172A"};">${value}</span>
        </td>
      </tr>
    </table>
  `;
}

export function amountBox(ht: string, tva: string, ttc: string, currency: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="margin:20px 0;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;">
          <table role="presentation" width="100%"><tr>
            <td style="font-size:13px;color:#64748B;">Sous-total HT</td>
            <td align="right" style="font-size:13px;font-weight:600;color:#334155;font-family:monospace;">${ht}</td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;">
          <table role="presentation" width="100%"><tr>
            <td style="font-size:13px;color:#64748B;">TVA</td>
            <td align="right" style="font-size:13px;font-weight:600;color:#334155;font-family:monospace;">${tva}</td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#F0FFF4;">
          <table role="presentation" width="100%"><tr>
            <td style="font-size:14px;font-weight:700;color:${BRAND};">Total TTC · ${currency}</td>
            <td align="right" style="font-size:18px;font-weight:800;color:${BRAND};font-family:monospace;">${ttc}</td>
          </tr></table>
        </td>
      </tr>
    </table>
  `;
}

export function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td style="border-radius:8px;background:${BRAND};">
          <a href="${url}" target="_blank"
            style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.01em;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;" />`;
}

export function infoGrid(items: { label: string; value: string }[]): string {
  const rows = items.map(({ label, value }) => `
    <tr>
      <td style="padding:6px 0;font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;width:40%;">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:#334155;font-weight:500;">${value}</td>
    </tr>
  `).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">${rows}</table>`;
}

export function alertBox(text: string, type: "warning" | "danger" | "info" = "info"): string {
  const colors = {
    warning: { bg: "#FFFBEB", border: "#D97706", text: "#92400E" },
    danger:  { bg: "#FEF2F2", border: "#DC2626", text: "#991B1B" },
    info:    { bg: "#EFF6FF", border: "#1D4ED8", text: "#1E3A8A" },
  }[type];
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
      <tr>
        <td style="padding:12px 16px;background:${colors.bg};border-radius:8px;border-left:3px solid ${colors.border};">
          <p style="margin:0;font-size:13px;color:${colors.text};line-height:1.6;">${text}</p>
        </td>
      </tr>
    </table>
  `;
}

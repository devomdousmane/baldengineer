import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

const ALLOWED_TAGS = new Set(["p", "br", "strong", "em", "ul", "ol", "li", "a", "blockquote", "code"]);

/**
 * Retire tout tag HTML non whitelisté et neutralise les attributs dangereux
 * (on*, href javascript:) sur les balises restantes. marked ne génère que des
 * tags connus par construction ; cette passe protège en plus contre un HTML
 * qui viendrait à être injecté directement (défense en profondeur).
 */
function sanitize(html: string): string {
  return html
    .replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (match, closing, tag, attrs) => {
      const lower = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(lower)) return "";
      if (closing) return `</${lower}>`;
      if (lower === "a") {
        const hrefMatch = /href\s*=\s*["']([^"']*)["']/i.exec(attrs);
        const href = hrefMatch?.[1] ?? "";
        const safeHref = /^(https?:|mailto:)/i.test(href) ? href : "#";
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
      }
      return `<${lower}>`;
    });
}

/** Convertit du markdown utilisateur en HTML sûr, prêt à insérer dans un email. */
export function markdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return sanitize(rawHtml);
}

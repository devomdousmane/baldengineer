import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

marked.setOptions({ breaks: true, gfm: true });

/** Convertit du markdown utilisateur en HTML sûr, prêt à insérer dans un email. */
export function markdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li", "a", "blockquote", "code"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

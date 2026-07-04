"use client";

import { useRef, useState, useMemo } from "react";
import { Bold, Italic, List, Link2, Eye, Pencil } from "lucide-react";
import { markdownToSafeHtml } from "@/lib/markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

const TOOLBAR_ITEMS: { icon: React.ElementType; label: string; wrap: [string, string]; block?: boolean }[] = [
  { icon: Bold,   label: "Gras",     wrap: ["**", "**"] },
  { icon: Italic, label: "Italique", wrap: ["_", "_"] },
  { icon: List,   label: "Liste",    wrap: ["- ", ""], block: true },
  { icon: Link2,  label: "Lien",     wrap: ["[", "](https://)"] },
];

export function MarkdownEditor({ value, onChange, label, placeholder, rows = 4 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewHtml = useMemo(() => markdownToSafeHtml(value || "*Rien à prévisualiser*"), [value]);

  const applyFormat = (before: string, after: string, block = false) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end);

    let next: string;
    let cursorStart: number;
    let cursorEnd: number;

    if (block) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      next = `${value.slice(0, lineStart)}${before}${value.slice(lineStart)}`;
      cursorStart = cursorEnd = start + before.length;
    } else {
      next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
      cursorStart = start + before.length;
      cursorEnd = end + before.length;
    }

    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--color-text-2)]">{label}</label>}

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-accent)] transition-shadow duration-[var(--dur-fast)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-1 px-2 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg-2)] flex-wrap">
          <div className="flex items-center gap-0.5">
            {TOOLBAR_ITEMS.map(({ icon: Icon, label: itemLabel, wrap, block }) => (
              <button
                key={itemLabel}
                type="button"
                onClick={() => applyFormat(wrap[0], wrap[1], block)}
                disabled={tab === "preview"}
                title={itemLabel}
                aria-label={itemLabel}
                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-2)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] transition-colors duration-[var(--dur-fast)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`flex items-center gap-1 px-2 h-7 rounded-[var(--radius-sm)] text-xs font-medium transition-colors duration-[var(--dur-fast)] cursor-pointer ${
                tab === "write" ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-[var(--shadow-xs)]" : "text-[var(--color-text-3)] hover:text-[var(--color-text)]"
              }`}
            >
              <Pencil className="w-3 h-3" /> Écrire
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1 px-2 h-7 rounded-[var(--radius-sm)] text-xs font-medium transition-colors duration-[var(--dur-fast)] cursor-pointer ${
                tab === "preview" ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-[var(--shadow-xs)]" : "text-[var(--color-text-3)] hover:text-[var(--color-text)]"
              }`}
            >
              <Eye className="w-3 h-3" /> Aperçu
            </button>
          </div>
        </div>

        {/* Body */}
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full resize-none bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-3)] focus:outline-none"
          />
        ) : (
          <div
            className="px-3 py-2.5 text-sm text-[var(--color-text)] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-[var(--color-accent)] [&_a]:underline"
            style={{ minHeight: `${rows * 1.5 + 1.25}rem` }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
      <p className="text-[11px] text-[var(--color-text-3)]">
        Markdown supporté : **gras**, _italique_, listes, [liens](url)
      </p>
    </div>
  );
}

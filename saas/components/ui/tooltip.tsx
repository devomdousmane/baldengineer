"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className = "" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative inline-flex items-center ${className}`}>
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="cursor-help"
      >
        {children ?? (
          <HelpCircle className="w-3.5 h-3.5 text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors duration-[var(--dur-fast)]" />
        )}
      </div>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[var(--z-toast)] w-64 pointer-events-none animate-fade-in">
          <div className="bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 shadow-[var(--shadow-lg)] text-xs text-[var(--color-text)] leading-relaxed">
            {content}
          </div>
          <div className="w-2 h-2 bg-[var(--color-elevated)] border-b border-r border-[var(--color-border)] rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  );
}

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  className?: string;
}

export function LabelWithTooltip({ label, tooltip, required, className = "" }: LabelWithTooltipProps) {
  return (
    <div className={`flex items-center gap-1.5 mb-1 ${className}`}>
      <span className="text-xs font-medium text-[var(--color-text-2)]">
        {label}
        {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
      </span>
      <Tooltip content={tooltip} />
    </div>
  );
}

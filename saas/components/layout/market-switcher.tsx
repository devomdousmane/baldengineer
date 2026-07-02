"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import { updateDefaultMarketAction } from "@/lib/actions/profile";
import type { Market } from "@/types/database";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const markets: { value: Market; label: string; flag: string; color: string }[] = [
  { value: "france", label: "France", flag: "🇫🇷", color: "var(--color-fr)" },
  { value: "guinee", label: "Guinée", flag: "🇬🇳", color: "var(--color-gn)" },
];

export function MarketSwitcher({ market }: { market: Market }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (m: Market) => {
    if (m === market) { setOpen(false); return; }
    setOpen(false);
    startTransition(async () => {
      await updateDefaultMarketAction(m);
      router.refresh();
    });
  };

  const current = markets.find((m) => m.value === market)!;

  return (
    <div ref={ref} className="relative px-3 py-2 border-b border-[var(--color-border)]">
      <motion.button
        whileHover={{ backgroundColor: "var(--color-bg-2)" }}
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-md)] transition-colors disabled:opacity-60"
        aria-label="Changer de marché"
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: current.color }} />
        <span className="text-xs font-medium flex-1 text-left" style={{ color: current.color }}>
          {current.flag} {current.label}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease }}
        >
          <ChevronDown className="w-3 h-3 text-[var(--color-text-3)]" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease } }}
            exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.13 } }}
            className="absolute left-3 right-3 top-full mt-1 z-50 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-md)] overflow-hidden"
          >
            {markets.map((m, i) => (
              <motion.button
                key={m.value}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.18, delay: i * 0.04, ease } }}
                onClick={() => select(m.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-[var(--color-bg-2)] transition-colors"
              >
                <span className="text-base leading-none">{m.flag}</span>
                <span className="flex-1 text-xs font-medium text-[var(--color-text)]">{m.label}</span>
                {m.value === market && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: m.color }} />
                  </motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

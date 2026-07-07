"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X, Sparkles } from "lucide-react";

export interface TourStep {
  /** Sélecteur CSS de l'élément à mettre en évidence (attribut data-tour recommandé). */
  target: string;
  title: string;
  body: string;
  /** Route à visiter avant cette étape, si elle n'est pas sur la page courante. */
  href?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const STORAGE_KEY = "baldpro:tour-seen";

export const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="logo"]',
    title: "Bienvenue sur BaldPro",
    body: "Votre outil de gestion pour devis, factures, missions et comptabilité — France et Guinée. Cette courte visite vous montre l'essentiel en quelques étapes.",
    href: "/",
    placement: "bottom",
  },
  {
    target: '[data-tour="market-switcher"]',
    title: "Marché actif",
    body: "Basculez entre France et Guinée ici. La devise, les identifiants fiscaux et la numérotation des documents s'adaptent automatiquement.",
    href: "/",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-clients"]',
    title: "Vos clients",
    body: "Centralisez vos clients France et Guinée. Chaque client est lié à ses devis, factures et missions.",
    href: "/",
    placement: "right",
  },
  {
    target: '[data-tour="nav-devis"]',
    title: "Devis",
    body: "Créez des devis et convertissez-les en facture en un clic une fois acceptés par le client.",
    href: "/",
    placement: "right",
  },
  {
    target: '[data-tour="nav-factures"]',
    title: "Factures",
    body: "Facturez, encaissez et relancez vos clients. Conformité Factur-X incluse pour la France.",
    href: "/",
    placement: "right",
  },
  {
    target: '[data-tour="dashboard-filters"]',
    title: "Filtres du tableau de bord",
    body: "Changez la période et le marché affichés — tous les indicateurs et graphiques se mettent à jour instantanément.",
    href: "/",
    placement: "bottom",
  },
  {
    target: '[data-tour="ai-panel-button"]',
    title: "Assistant IA",
    body: "Posez vos questions sur la facturation, la conformité ou la gestion de trésorerie directement depuis l'application.",
    href: "/",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-aide"]',
    title: "Besoin d'aide ?",
    body: "Retrouvez cette visite guidée et toute la documentation à tout moment depuis ce lien.",
    href: "/",
    placement: "right",
  },
];

interface Rect { top: number; left: number; width: number; height: number }

function useTargetRect(selector: string | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!selector) return;

    const measure = () => {
      const el = document.querySelector(selector);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const raf = requestAnimationFrame(measure);
    /* Re-mesure pendant ~300ms : couvre l'ouverture animée d'une catégorie de sidebar
       repliée (accordéon height:0→auto), qui ne déclenche ni resize ni scroll. */
    const retimers = [50, 100, 150, 220, 300].map((ms) => setTimeout(measure, ms));
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      retimers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [selector]);

  /* Réinitialise l'état quand la cible change, sans setState synchrone dans l'effet ci-dessus. */
  const [lastSelector, setLastSelector] = useState(selector);
  if (selector !== lastSelector) {
    setLastSelector(selector);
    if (rect !== null) setRect(null);
  }

  return rect;
}

interface SpotlightTourProps {
  open: boolean;
  onClose: () => void;
  steps?: TourStep[];
}

export function SpotlightTour({ open, onClose, steps = TOUR_STEPS }: SpotlightTourProps) {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const step = steps[index];
  const rect = useTargetRect(open ? step?.target ?? null : null);

  /* Revient à la première étape à chaque (ré)ouverture, sans setState synchrone dans un effet. */
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && index !== 0) setIndex(0);
  }

  /* Navigue vers la route requise par l'étape si nécessaire. */
  useEffect(() => {
    if (open && step?.href && step.href !== pathname) {
      router.push(step.href);
    }
  }, [open, step, pathname, router]);

  /* Signale la cible de l'étape — permet à la sidebar d'ouvrir la catégorie qui la contient
     avant qu'on ne mesure sa position (sinon un item dans une section repliée resterait invisible). */
  useEffect(() => {
    if (open && step?.target) {
      window.dispatchEvent(new CustomEvent("baldpro:tour-target", { detail: step.target }));
    }
  }, [open, step]);

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }, [onClose]);

  const next = () => {
    if (index < steps.length - 1) setIndex((i) => i + 1);
    else finish();
  };
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  if (!open) return null;

  const pad = 8;
  const holeStyle = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  /* Position de la bulle : sous/au-dessus/à côté de l'élément, avec garde-fous d'écran. */
  const placement = step.placement ?? "bottom";
  const bubbleWidth = 320;
  let bubbleTop = 0;
  let bubbleLeft = 0;

  if (holeStyle) {
    if (placement === "bottom") {
      bubbleTop = holeStyle.top + holeStyle.height + 12;
      bubbleLeft = holeStyle.left;
    } else if (placement === "top") {
      bubbleTop = holeStyle.top - 12;
      bubbleLeft = holeStyle.left;
    } else if (placement === "right") {
      bubbleTop = holeStyle.top;
      bubbleLeft = holeStyle.left + holeStyle.width + 12;
    } else {
      bubbleTop = holeStyle.top;
      bubbleLeft = Math.max(12, holeStyle.left - bubbleWidth - 12);
    }
  }

  if (typeof window !== "undefined") {
    bubbleLeft = Math.min(Math.max(12, bubbleLeft), window.innerWidth - bubbleWidth - 12);
    if (placement === "top") bubbleTop = Math.max(12, bubbleTop - 140);
    bubbleTop = Math.min(Math.max(12, bubbleTop), window.innerHeight - 200);
  }

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[var(--z-toast)]"
        role="dialog"
        aria-modal="true"
        aria-label="Visite guidée"
      >
        {/* Overlay assombri avec trou découpé autour de la cible (box-shadow géant) */}
        <div
          className="absolute inset-0 bg-transparent"
          onClick={finish}
        >
          {holeStyle ? (
            <motion.div
              key={step.target}
              initial={false}
              animate={{ top: holeStyle.top, left: holeStyle.left, width: holeStyle.width, height: holeStyle.height }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute rounded-[var(--radius-md)] pointer-events-none"
              style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" }}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />
          )}
        </div>

        {/* Bulle */}
        <motion.div
          key={`bubble-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, top: bubbleTop, left: bubbleLeft }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-xl)] p-4"
          style={{ width: bubbleWidth }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-[var(--color-accent-dim)] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{step.title}</p>
            </div>
            <button
              onClick={finish}
              aria-label="Fermer la visite"
              className="w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-text-3)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-2)] leading-relaxed mb-4">{step.body}</p>

          <div className="flex items-center justify-between">
            <p className="text-3xs text-[var(--color-text-3)] tabular-nums">{index + 1} / {steps.length}</p>
            <div className="flex items-center gap-1.5">
              {index > 0 && (
                <button
                  onClick={prev}
                  className="flex items-center gap-1 h-7 px-2.5 rounded-[var(--radius-md)] text-xs text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> Précédent
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 h-7 px-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hi)] transition-colors cursor-pointer"
              >
                {index < steps.length - 1 ? <>Suivant <ArrowRight className="w-3 h-3" /></> : "Terminer"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Vrai si l'utilisateur n'a jamais terminé/fermé la visite — à utiliser pour le déclenchement auto. */
export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

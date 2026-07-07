"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseFocusTrapOptions {
  open: boolean;
  onEscape?: () => void;
  /** Élément à focus à l'ouverture ; par défaut, le premier élément focusable du conteneur. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Piège le focus (Tab/Shift+Tab) à l'intérieur du conteneur tant que `open` est vrai,
 * ferme sur Escape, et restitue le focus à l'élément précédemment actif à la fermeture.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, { open, onEscape, initialFocusRef }: UseFocusTrapOptions) {
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      if (initialFocusRef?.current) { initialFocusRef.current.focus(); return; }
      const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    };
    /* Laisse le temps au contenu animé (AnimatePresence) de monter dans le DOM. */
    const raf = requestAnimationFrame(focusInitial);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onEscape?.(); return; }
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onEscape, containerRef, initialFocusRef]);
}

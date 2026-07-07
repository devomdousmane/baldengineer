"use client";

import { useEffect, useRef, type RefObject } from "react";

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
  /* onEscape est souvent une closure inline recréée à chaque render du parent (ex. re-render
     déclenché par la frappe dans un champ du formulaire) — si elle figurait dans le tableau de
     dépendances ci-dessous, l'effet entier se relançait à chaque frappe : son cleanup reforce le
     focus vers l'élément actif avant ouverture, puis le setup le renvoie dans le champ, ce qui
     éjectait le focus du champ à chaque caractère tapé. On la lit via une ref pour ne dépendre
     que de ce qui doit réellement redéclencher le piège de focus : l'ouverture/fermeture. */
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

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
      if (e.key === "Escape") { onEscapeRef.current?.(); return; }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, containerRef, initialFocusRef]);
}

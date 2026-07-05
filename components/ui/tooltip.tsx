"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

type Side = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  children?: ReactNode;
  className?: string;
  /** Côté préféré — bascule automatiquement si pas assez de place. */
  side?: Side;
  /** Délai avant apparition au survol, en ms. */
  delay?: number;
}

const GAP = 8;

export function Tooltip({ content, children, className = "", side = "top", delay = 150 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [resolvedSide, setResolvedSide] = useState<Side>(side);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const showTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleShow = () => {
    if (showTimeout.current) clearTimeout(showTimeout.current);
    showTimeout.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (showTimeout.current) clearTimeout(showTimeout.current);
    setVisible(false);
  };

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const bubble = bubbleRef.current?.getBoundingClientRect();
    const bw = bubble?.width ?? 200;
    const bh = bubble?.height ?? 36;

    let finalSide = side;
    if (side === "top" && trigger.top - bh - GAP < 0) finalSide = "bottom";
    else if (side === "bottom" && trigger.bottom + bh + GAP > window.innerHeight) finalSide = "top";
    else if (side === "left" && trigger.left - bw - GAP < 0) finalSide = "right";
    else if (side === "right" && trigger.right + bw + GAP > window.innerWidth) finalSide = "left";
    setResolvedSide(finalSide);

    let top = 0, left = 0;
    switch (finalSide) {
      case "top":    top = trigger.top - bh - GAP;               left = trigger.left + trigger.width / 2 - bw / 2; break;
      case "bottom": top = trigger.bottom + GAP;                 left = trigger.left + trigger.width / 2 - bw / 2; break;
      case "left":   top = trigger.top + trigger.height / 2 - bh / 2; left = trigger.left - bw - GAP; break;
      case "right":  top = trigger.top + trigger.height / 2 - bh / 2; left = trigger.right + GAP; break;
    }
    left = Math.min(Math.max(left, GAP), window.innerWidth - bw - GAP);
    top = Math.min(Math.max(top, GAP), window.innerHeight - bh - GAP);
    setCoords({ top, left });
  }, [visible, side]);

  useEffect(() => () => { if (showTimeout.current) clearTimeout(showTimeout.current); }, []);

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={scheduleShow}
      onMouseLeave={hide}
      onFocus={scheduleShow}
      onBlur={hide}
    >
      <div tabIndex={children ? undefined : 0} className="cursor-help">
        {children ?? (
          <HelpCircle className="w-3.5 h-3.5 text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors duration-[var(--dur-fast)]" />
        )}
      </div>
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={bubbleRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="w-max max-w-64 pointer-events-none z-[var(--z-toast)]"
            role="tooltip"
          >
            <div className="bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 shadow-[var(--shadow-lg)] text-xs text-[var(--color-text)] leading-relaxed">
              {content}
            </div>
            <div
              aria-hidden="true"
              className="absolute w-2 h-2 bg-[var(--color-elevated)] border-[var(--color-border)] rotate-45"
              style={
                resolvedSide === "top"    ? { bottom: -4, left: "50%", marginLeft: -4, borderBottom: "1px solid", borderRight: "1px solid" } :
                resolvedSide === "bottom" ? { top: -4, left: "50%", marginLeft: -4, borderTop: "1px solid", borderLeft: "1px solid" } :
                resolvedSide === "left"   ? { right: -4, top: "50%", marginTop: -4, borderTop: "1px solid", borderRight: "1px solid" } :
                                            { left: -4, top: "50%", marginTop: -4, borderBottom: "1px solid", borderLeft: "1px solid" }
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
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

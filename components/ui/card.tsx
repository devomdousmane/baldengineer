"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const padMap: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-4 sm:p-5",
  lg:   "p-5 sm:p-6",
};

export function Card({ children, className = "", padding = "md", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-sm)] transition-shadow duration-[var(--dur-normal)] ${
        hover ? "hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-2)]" : ""
      } ${padMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Animated counter ─────────────────────────────────────────── */
function AnimatedCounter({ to, format }: { to: number; format?: (n: number) => string }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20, restDelta: 0.5 });
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const timeout = setTimeout(() => motionVal.set(to), 80);
    return () => clearTimeout(timeout);
  }, [to, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return <>{format ? format(display) : display.toLocaleString("fr-FR")}</>;
}

/* ── Sparkline ────────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} aria-hidden="true" className="opacity-70">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── KpiCard ──────────────────────────────────────────────────── */
interface KpiCardProps {
  label: string;
  value: string | number;
  rawValue?: number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accentColor?: string;
  sparkData?: number[];
  formatValue?: (n: number) => string;
  index?: number;
}

export function KpiCard({
  label, value, rawValue, subtitle, icon,
  trend, trendValue, accentColor = "var(--color-accent)",
  sparkData, formatValue, index = 0,
}: KpiCardProps) {
  const trendColor = trend === "up" ? "var(--color-success)" : trend === "down" ? "var(--color-danger)" : "var(--color-text-3)";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-sm)] p-4 sm:p-5 overflow-hidden relative transition-shadow duration-[var(--dur-normal)] hover:shadow-[var(--shadow-md)]"
    >
      {/* Accent bar — dégradé qui s'estompe vers la droite */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[var(--radius-lg)] transition-opacity duration-[var(--dur-normal)] opacity-80 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--color-text-2)] mb-1.5 truncate">{label}</p>

          <p className="text-2xl font-semibold text-[var(--color-text)] leading-none tabular-nums">
            {rawValue !== undefined && formatValue
              ? <AnimatedCounter to={rawValue} format={formatValue} />
              : typeof rawValue === "number" && !formatValue
              ? <AnimatedCounter to={rawValue} />
              : value
            }
          </p>

          {subtitle && (
            <p className="text-xs text-[var(--color-text-3)] mt-1.5 truncate">{subtitle}</p>
          )}

          {trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
              <p className="text-xs font-medium" style={{ color: trendColor }}>{trendValue}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            {icon}
          </div>
          {sparkData && <Sparkline data={sparkData} color={accentColor} />}
        </div>
      </div>
    </motion.div>
  );
}

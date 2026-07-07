import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "france" | "guinee" | "outline";

const variantStyles: Record<Variant, string> = {
  default:  "bg-[var(--color-bg-2)] text-[var(--color-text-2)]",
  success:  "bg-[var(--color-success-dim)] text-[var(--color-success)]",
  warning:  "bg-[var(--color-warning-dim)] text-[var(--color-warning)]",
  danger:   "bg-[var(--color-danger-dim)] text-[var(--color-danger)]",
  info:     "bg-[var(--color-info-dim)] text-[var(--color-info)]",
  france:   "bg-[var(--color-fr-dim)] text-[var(--color-fr)]",
  guinee:   "bg-[var(--color-gn-dim)] text-[var(--color-gn)]",
  outline:  "border border-[var(--color-border)] text-[var(--color-text-2)]",
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Badge({ variant = "default", children, className = "", title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium leading-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

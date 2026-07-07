import type { ReactNode } from "react";

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

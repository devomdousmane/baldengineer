import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "success" | "link";
type Size = "xs" | "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:   "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hi)] shadow-sm hover:shadow-[var(--shadow-glow)]",
  secondary: "bg-[var(--color-bg-2)] text-[var(--color-text)] hover:bg-[var(--color-border)] border border-[var(--color-border)]",
  ghost:     "text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)]",
  danger:    "bg-[var(--color-danger-dim)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white",
  outline:   "border border-[var(--color-border-2)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
  success:   "bg-[var(--color-success)] text-white hover:brightness-110 shadow-sm",
  link:      "text-[var(--color-accent)] underline-offset-4 hover:underline hover:text-[var(--color-accent-hi)]",
};

const sizeStyles: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, iconLeft, iconRight, children, className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium
          transition-all duration-[var(--dur-fast)]
          focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : iconLeft ? (
          <span className="shrink-0">{iconLeft}</span>
        ) : null}
        {children && <span>{children}</span>}
        {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

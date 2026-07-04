import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-3)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-border-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)]";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--color-text-2)]">
            {label}
            {props.required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-9 ${base} ${error ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-text-3)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = "", id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--color-text-2)]">
            {label}
            {props.required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`h-9 ${base} ${error ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-text-3)]">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--color-text-2)]">
            {label}
            {props.required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`py-2 resize-none ${base} ${error ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-text-3)]">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

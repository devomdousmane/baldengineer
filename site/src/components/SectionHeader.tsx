import AnimatedSection from "./AnimatedSection";

interface Props {
  label: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ label, title, subtitle }: Props) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <AnimatedSection delay={0}>
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest mb-4"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-cta) 14%, transparent)",
            color: "var(--color-cta)",
            fontFamily: "var(--font-jetbrains), monospace",
            border: "1px solid color-mix(in srgb, var(--color-cta) 25%, transparent)",
          }}
        >
          {label}
        </span>
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-space-grotesk), sans-serif", color: "var(--color-primary)" }}>
          {title}
        </h2>
      </AnimatedSection>
      {subtitle && (
        <AnimatedSection delay={0.2}>
          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed" style={{ color: "var(--color-muted)" }}>
            {subtitle}
          </p>
        </AnimatedSection>
      )}
    </div>
  );
}

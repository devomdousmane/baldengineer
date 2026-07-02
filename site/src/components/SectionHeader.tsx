import AnimatedSection from "./AnimatedSection";

interface Props {
  label: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ label, title, subtitle }: Props) {
  return (
    <div className="text-center mb-16 sm:mb-24">
      <AnimatedSection delay={0}>
        <div className="inline-flex flex-col items-center gap-3 mb-6">
          <span
            className="text-[10px] uppercase tracking-[0.25em] font-medium"
            style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}
          >
            {label}
          </span>
          <div
            className="h-px w-12"
            style={{ backgroundColor: "var(--color-gold)", opacity: 0.5 }}
          />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-light italic mb-6 leading-[1.1]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
      </AnimatedSection>

      {subtitle && (
        <AnimatedSection delay={0.18}>
          <p
            className="max-w-xl mx-auto leading-relaxed"
            style={{
              color: "var(--color-text-2)",
              fontSize: "var(--text-base)",
              fontFamily: "var(--font-body)",
            }}
          >
            {subtitle}
          </p>
        </AnimatedSection>
      )}
    </div>
  );
}

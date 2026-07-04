"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

interface Props {
  label: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ label, title, subtitle }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-10% 0px" });
  const reducedMotion = useReducedMotion();

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

      <motion.h2
        ref={titleRef}
        initial={reducedMotion ? undefined : { opacity: 0, y: 40, scale: 0.94, filter: "blur(6px)" }}
        animate={
          titleInView
            ? reducedMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : {}
        }
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl sm:text-5xl md:text-6xl font-light italic mb-6 leading-[1.1]"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </motion.h2>

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

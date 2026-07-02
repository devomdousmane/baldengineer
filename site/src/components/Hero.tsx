"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowDownRight, Zap, Phone } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const ElecField = dynamic(() => import("./three/ElecField"), { ssr: false });

/* ── Animated counter ────────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Main Hero ───────────────────────────────────────────────── */
export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const line1Ref   = useRef<HTMLDivElement>(null);
  const line2Ref   = useRef<HTMLDivElement>(null);
  const subRef     = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);

  /* GSAP entrance + scroll parallax */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.fromTo(line1Ref.current,  { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1.1 })
        .fromTo(line2Ref.current,  { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1.1 }, "-=0.7")
        .fromTo(subRef.current,    { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9 }, "-=0.5")
        .fromTo(ctaRef.current,    { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.5")
        .fromTo(statsRef.current,  { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.5");

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          if (contentRef.current) {
            gsap.set(contentRef.current, { y: self.progress * -100 });
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="accueil"
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-hero-bg)" }}
      aria-label="BaldEngineer — Ingénierie électrique"
    >
      {/* Three.js background */}
      <ElecField />

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(45,138,62,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,138,62,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-hero-bg))" }}
      />

      {/* Top accent line */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 h-px origin-left pointer-events-none"
        style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-28 pb-20"
      >
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex items-center gap-2 mb-12 sm:mb-16"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: "var(--color-accent-hi)" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--color-accent-hi)" }} />
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.25em]"
            style={{ color: "rgba(77,184,92,0.7)", fontFamily: "var(--font-mono)" }}
          >
            Disponible pour missions
          </span>
        </motion.div>

        {/* Headline */}
        <div className="mb-8 sm:mb-10" style={{ perspective: "1000px" }}>
          <div
            ref={line1Ref}
            className="block font-light italic leading-[0.95]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem, 11vw, 9.5rem)",
              color: "#ffffff",
              letterSpacing: "-0.02em",
              visibility: "hidden",
            }}
          >
            Thierno
          </div>
          <div
            ref={line2Ref}
            className="block font-light italic leading-[0.95]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem, 11vw, 9.5rem)",
              letterSpacing: "-0.02em",
              visibility: "hidden",
            }}
          >
            <span style={{ color: "#ffffff" }}>Bald</span>
            <span style={{ color: "var(--color-accent-hi)" }}>é</span>
          </div>
        </div>

        {/* Subtitle */}
        <div
          ref={subRef}
          className="flex flex-wrap items-center gap-4 mb-12 sm:mb-16"
          style={{ visibility: "hidden" }}
        >
          <span
            className="text-sm font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent-hi)", fontFamily: "var(--font-mono)" }}
          >
            Ingénieur CFO / CFA
          </span>
          <span className="hidden sm:block w-8 h-px" style={{ backgroundColor: "var(--color-gold)", opacity: 0.4 }} />
          <span
            className="text-sm"
            style={{ color: "rgba(152,148,144,0.8)", fontFamily: "var(--font-mono)" }}
          >
            Haute tension · Basse tension · Courants faibles
          </span>
        </div>

        {/* CTA + stats grid */}
        <div
          ref={ctaRef}
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-20 items-end"
          style={{ visibility: "hidden" }}
        >
          <div>
            <p
              className="leading-[1.75] mb-8 max-w-[52ch]"
              style={{
                color: "rgba(226,228,220,0.65)",
                fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                fontFamily: "var(--font-body)",
              }}
            >
              Expert en électricité industrielle et tertiaire — je pilote vos
              projets de la conception à la réception : études HTA/BT,
              réseaux CFO/CFA, conformité NF&nbsp;C&nbsp;15-100, suivi de chantier.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{ backgroundColor: "var(--color-accent)", minHeight: "48px", boxShadow: "var(--shadow-glow)" }}
              >
                <Zap className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                Demander un devis
              </a>
              <a
                href="tel:0659980688"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:bg-white/5 active:scale-95"
                style={{ color: "var(--color-accent-hi)", border: "1px solid rgba(45,138,62,0.35)", minHeight: "48px" }}
                aria-label="Appeler le 06 59 98 06 88"
              >
                <Phone className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                06.59.98.06.88
              </a>
            </div>
          </div>

          <div
            ref={statsRef}
            className="flex lg:flex-col gap-6 lg:gap-8 lg:items-end"
            style={{ visibility: "hidden" }}
          >
            {[
              { value: 15, suffix: "+", label: "Ans d'expérience" },
              { value: 10, suffix: "+", label: "Entreprises" },
            ].map((s) => (
              <div key={s.label} className="text-right">
                <div
                  className="font-light leading-none tabular-nums"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                    color: "var(--color-accent-hi)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div
                  className="text-[10px] mt-1 uppercase tracking-[0.2em]"
                  style={{ color: "rgba(74,222,128,0.4)", fontFamily: "var(--font-mono)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
            <div className="text-right">
              <div
                className="font-light leading-none italic"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", color: "var(--color-accent-hi)" }}
              >
                CFO/CFA
              </div>
              <div
                className="text-[10px] mt-1 uppercase tracking-[0.2em]"
                style={{ color: "rgba(74,222,128,0.4)", fontFamily: "var(--font-mono)" }}
              >
                Double expertise
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-8 left-6 sm:left-10 flex items-center gap-2 select-none"
        onClick={() => document.getElementById("apropos")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="Défiler vers le bas"
        role="button"
        tabIndex={0}
      >
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDownRight className="w-4 h-4" style={{ color: "rgba(74,222,128,0.45)" }} strokeWidth={1.5} />
        </motion.div>
        <span
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgba(74,222,128,0.35)", fontFamily: "var(--font-mono)" }}
        >
          Défiler
        </span>
      </motion.div>

      {/* Section label */}
      <div
        aria-hidden="true"
        className="absolute top-8 right-8 hidden lg:block"
        style={{
          color: "rgba(45,138,62,0.2)",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.2em",
          writingMode: "vertical-rl",
          textTransform: "uppercase",
        }}
      >
        01 / Introduction
      </div>
    </section>
  );
}

"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, Zap, Phone } from "lucide-react";

/* ── Letter-by-letter animated word ─────────────────────────── */
function KineticWord({
  word,
  baseDelay = 0,
  className = "",
  color,
}: {
  word: string;
  baseDelay?: number;
  className?: string;
  color?: string;
}) {
  return (
    <span className={className} style={{ color }} aria-label={word}>
      {word.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.55,
            delay: baseDelay + i * 0.04,
            ease: "easeOut",
          }}
          className="inline-block"
          style={{ transformOrigin: "bottom" }}
          aria-hidden="true"
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}

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
        const duration = 1400;
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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY  = useTransform(scrollYProgress, [0, 1], ["0px", "-80px"]);
  const opacity   = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="accueil"
      ref={ref}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-hero-bg)" }}
      aria-label="BaldEngineer — Ingénierie électrique"
    >
      {/* ── Background grid ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(46,125,50,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,125,50,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Gradient bottom fade to site bg ── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg))" }}
      />

      {/* ── Decorative voltage line ── */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 h-[2px] origin-left"
        style={{ backgroundColor: "var(--color-cta)" }}
      />

      {/* ── Main content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-16"
      >

        {/* ── Status pill ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="flex items-center gap-2 mb-10 sm:mb-14"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span
            className="text-[11px] uppercase tracking-[0.2em] font-medium"
            style={{ color: "rgba(74,222,128,0.7)", fontFamily: "var(--font-jetbrains), monospace" }}
          >
            Disponible pour missions
          </span>
        </motion.div>

        {/* ── Kinetic headline ── */}
        <div
          className="mb-6 sm:mb-8 overflow-hidden"
          style={{ perspective: "800px" }}
        >
          {/* Line 1: THIERNO */}
          <div
            className="block font-black leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            <KineticWord word="THIERNO" baseDelay={0.2} />
          </div>

          {/* Line 2: BALDE — accent green */}
          <div
            className="block font-black leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
              letterSpacing: "-0.03em",
            }}
          >
            <KineticWord
              word="BALD"
              baseDelay={0.2 + 7 * 0.04}
              color="#ffffff"
            />
            <KineticWord
              word="E"
              baseDelay={0.2 + 11 * 0.04}
              color="#4ADE80"
            />
          </div>
        </div>

        {/* ── Subtitle line ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.85, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-3 sm:gap-5 mb-10 sm:mb-14"
        >
          <span
            className="text-sm sm:text-base font-semibold uppercase tracking-[0.18em]"
            style={{ color: "#4ADE80", fontFamily: "var(--font-jetbrains), monospace" }}
          >
            Ingénieur CFO / CFA
          </span>
          <span className="hidden sm:block w-8 h-[1px]" style={{ backgroundColor: "rgba(74,222,128,0.35)" }} />
          <span
            className="text-sm sm:text-base"
            style={{ color: "rgba(226,232,240,0.55)", fontFamily: "var(--font-jetbrains), monospace" }}
          >
            Haute tension · Basse tension · Courants faibles
          </span>
        </motion.div>

        {/* ── Grid: description + stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.0, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-20 items-end"
        >
          {/* Left: description + CTAs */}
          <div>
            <p
              className="leading-[1.75] mb-8 max-w-[52ch]"
              style={{
                color: "rgba(226,232,240,0.7)",
                fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
              }}
            >
              Expert en électricité industrielle et tertiaire — je pilote vos
              projets de la conception à la réception&nbsp;: études HTA/BT,
              réseaux CFO/CFA, conformité NF&nbsp;C&nbsp;15-100, suivi de
              chantier.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                style={{ backgroundColor: "#2E7D32", minHeight: "48px" }}
              >
                <Zap className="w-4 h-4 shrink-0" />
                Demander un devis
              </a>
              <a
                href="tel:0659980688"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/50"
                style={{
                  color: "#86EFAC",
                  border: "1px solid rgba(46,125,50,0.45)",
                  minHeight: "48px",
                }}
              >
                <Phone className="w-4 h-4 shrink-0" />
                06.59.98.06.88
              </a>
            </div>
          </div>

          {/* Right: stats column */}
          <div className="flex lg:flex-col gap-6 lg:gap-8 lg:items-end">
            {[
              { value: 15, suffix: "+", label: "Ans d'expérience" },
              { value: 10, suffix: "+", label: "Entreprises" },
            ].map((s) => (
              <div key={s.label} className="text-right">
                <div
                  className="font-black leading-none tabular-nums"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                    color: "#4ADE80",
                    letterSpacing: "-0.04em",
                  }}
                >
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div
                  className="text-xs mt-1 uppercase tracking-widest"
                  style={{
                    color: "rgba(74,222,128,0.45)",
                    fontFamily: "var(--font-jetbrains), monospace",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
            <div className="text-right">
              <div
                className="font-black leading-none"
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
                  color: "#4ADE80",
                  letterSpacing: "-0.04em",
                }}
              >
                CFO/CFA
              </div>
              <div
                className="text-xs mt-1 uppercase tracking-widest"
                style={{
                  color: "rgba(74,222,128,0.45)",
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                Double expertise
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Scroll cue ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.6 }}
        className="absolute bottom-8 left-5 sm:left-8 flex items-center gap-2 cursor-pointer select-none"
        onClick={() =>
          document.getElementById("apropos")?.scrollIntoView({ behavior: "smooth" })
        }
        aria-label="Défiler vers le bas"
      >
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDownRight
            className="w-4 h-4"
            style={{ color: "rgba(74,222,128,0.5)" }}
          />
        </motion.div>
        <span
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{
            color: "rgba(74,222,128,0.4)",
            fontFamily: "var(--font-jetbrains), monospace",
          }}
        >
          Défiler
        </span>
      </motion.div>

      {/* ── Section label top-right ── */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute top-6 right-6 hidden lg:block"
        style={{
          color: "rgba(46,125,50,0.25)",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "10px",
          letterSpacing: "0.18em",
          writingMode: "vertical-rl",
          textTransform: "uppercase",
        }}
      >
        01 / Introduction
      </motion.div>
    </section>
  );
}

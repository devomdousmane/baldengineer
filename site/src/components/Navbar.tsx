"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Phone, X, ArrowUpRight, Menu } from "lucide-react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

const sections = [
  { id: "accueil",      label: "Accueil" },
  { id: "apropos",      label: "À propos" },
  { id: "competences",  label: "Compétences" },
  { id: "services",     label: "Services" },
  { id: "realisations", label: "Réalisations" },
  { id: "experience",   label: "Expérience" },
  { id: "contact",      label: "Contact" },
];

export default function Navbar() {
  const [active, setActive]         = useState("accueil");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  const { scrollYProgress } = useScroll();
  const barScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.1, 0.5] }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ══ TOP BAR ══════════════════════════════════════════════ */}
      <motion.header
        role="banner"
        className="fixed top-0 left-0 right-0 z-[50] flex items-center justify-between px-6 sm:px-10 h-[72px]"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: scrolled
            ? "color-mix(in srgb, var(--color-void) 90%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(1.3)" : "none",
          borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
          transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
        }}
      >
        {/* Scroll progress line */}
        <motion.div
          className="absolute bottom-0 left-0 h-px w-full origin-left pointer-events-none"
          style={{
            scaleX: barScaleX,
            background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hi))",
            opacity: scrolled ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Logo */}
        <a
          href="#accueil"
          className="flex items-center min-h-[44px] shrink-0"
          aria-label="BaldEngineer — retour accueil"
        >
          <Image
            src="/logo.jpg"
            alt="BaldEngineer"
            width={130}
            height={36}
            className={scrolled ? "" : "brightness-0 invert"}
            style={{ transition: "filter 0.4s ease" }}
            unoptimized
            priority
          />
        </a>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
          {sections.slice(1, -1).map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="relative text-xs uppercase tracking-[0.15em] font-medium transition-colors duration-300"
              style={{
                fontFamily: "var(--font-mono)",
                color: active === s.id ? "var(--color-accent-hi)" : "var(--color-text-2)",
              }}
              aria-current={active === s.id ? "true" : undefined}
            >
              {s.label}
              {active === s.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{ backgroundColor: "var(--color-accent)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <AnimatePresence>
            {scrolled && (
              <motion.a
                href="tel:0659980688"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-medium overflow-hidden whitespace-nowrap min-h-[44px] transition-opacity duration-200 hover:opacity-70"
                style={{
                  color: "var(--color-accent-hi)",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-mono)",
                }}
                aria-label="Appeler Thierno BALDE"
              >
                <Phone className="w-3 h-3 shrink-0" />
                06.59.98.06.88
              </motion.a>
            )}
          </AnimatePresence>

          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold text-white min-h-[44px] transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Devis gratuit
            <ArrowUpRight className="w-3 h-3 shrink-0" />
          </a>

          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            style={{
              color: scrolled ? "var(--color-text)" : "#ffffff",
              border: "1px solid var(--color-border)",
            }}
          >
            <Menu className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </motion.header>

      {/* ══ MOBILE MENU ══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[70] lg:hidden"
              style={{ backgroundColor: "rgba(5,8,10,0.7)", backdropFilter: "blur(8px)" }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              id="mobile-menu"
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: "0%" }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 bottom-0 z-[80] w-[80vw] max-w-sm flex flex-col lg:hidden"
              style={{
                backgroundColor: "var(--color-surface)",
                borderLeft: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-4)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 h-[72px] shrink-0 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Image src="/logo.jpg" alt="BaldEngineer" width={110} height={30} unoptimized />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200"
                  style={{ color: "var(--color-text-2)", border: "1px solid var(--color-border)" }}
                  aria-label="Fermer le menu"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 flex flex-col justify-center px-8 gap-1" aria-label="Menu mobile">
                {sections.map((s, i) => (
                  <motion.a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between py-4 border-b min-h-[56px] group"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span
                      className="text-2xl font-light italic transition-colors duration-200"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: active === s.id ? "var(--color-accent-hi)" : "var(--color-text)",
                      }}
                    >
                      {s.label}
                    </span>
                    {active === s.id && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--color-accent)" }} />
                    )}
                  </motion.a>
                ))}
              </nav>

              {/* Bottom actions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.35 }}
                className="px-8 pb-10 flex flex-col gap-3 shrink-0"
              >
                <a
                  href="tel:0659980688"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-full border text-sm font-medium min-h-[52px] transition-opacity duration-200 hover:opacity-70"
                  style={{
                    color: "var(--color-accent-hi)",
                    borderColor: "var(--color-border)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  06.59.98.06.88
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold text-white min-h-[52px] transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: "var(--color-accent)" }}
                >
                  Demander un devis
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

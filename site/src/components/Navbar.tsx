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

/* ── Dot pill for desktop side nav ─────────────────────────── */
function DotItem({
  section,
  active,
}: {
  section: { id: string; label: string };
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`#${section.id}`}
      className="relative flex items-center justify-end cursor-pointer"
      aria-label={`Aller à ${section.label}`}
      aria-current={active ? "true" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ minHeight: "28px", minWidth: "28px" }}
    >
      {/* Label tooltip — left of the dot */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: 8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-8 whitespace-nowrap text-[11px] font-semibold px-2.5 py-1 rounded-md pointer-events-none select-none"
            style={{
              backgroundColor: "var(--color-cta)",
              color: "#fff",
              fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0.05em",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            {section.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Dot / pill */}
      <motion.span
        animate={{
          width: active ? 24 : hovered ? 12 : 8,
          height: 8,
          borderRadius: 99,
          backgroundColor: active
            ? "var(--color-cta)"
            : hovered
            ? "var(--color-cta)"
            : "var(--color-border)",
          opacity: active ? 1 : hovered ? 0.8 : 0.5,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 40 }}
        className="block shrink-0"
      />
    </a>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function Navbar() {
  const [active, setActive]       = useState("accueil");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  /* Scroll progress for thin line */
  const { scrollYProgress } = useScroll();
  const barScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  /* Detect scroll past hero */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Active section via IntersectionObserver */
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

  /* Lock scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ══ DESKTOP — vertical dot rail, fixed right ══════════ */}
      <nav
        className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-[60] flex-col items-end gap-4"
        aria-label="Navigation par sections"
      >
        {sections.map((s) => (
          <DotItem key={s.id} section={s} active={active === s.id} />
        ))}
      </nav>

      {/* ══ TOP STRIP — logo + actions ════════════════════════ */}
      <motion.header
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 h-14"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          background: scrolled
            ? "color-mix(in srgb, var(--color-card) 90%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--color-border)"
            : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        }}
      >
        {/* Progress line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left pointer-events-none"
          style={{
            scaleX: barScaleX,
            backgroundColor: "var(--color-cta)",
            opacity: scrolled ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />

        {/* Logo */}
        <a
          href="#accueil"
          className="flex items-center cursor-pointer min-h-[44px] shrink-0"
          aria-label="BaldEngineer — retour accueil"
        >
          <Image
            src="/logo.png"
            alt="BaldEngineer"
            width={120}
            height={32}
            className={scrolled ? "dark:brightness-0 dark:invert" : "brightness-0 invert"}
            unoptimized
            priority
          />
        </a>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          {/* Phone — reveals after scroll */}
          <AnimatePresence>
            {scrolled && (
              <motion.a
                href="tel:0659980688"
                initial={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
                animate={{ opacity: 1, width: "auto", paddingLeft: 12, paddingRight: 12 }}
                exit={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="hidden sm:inline-flex items-center gap-1.5 py-2 rounded-lg text-[11px] font-medium overflow-hidden whitespace-nowrap cursor-pointer min-h-[44px] transition-opacity duration-200 hover:opacity-70"
                style={{
                  color: "var(--color-cta)",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
                aria-label="Appeler"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                06.59.98.06.88
              </motion.a>
            )}
          </AnimatePresence>

          {/* CTA */}
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white cursor-pointer min-h-[44px] transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--color-cta)" }}
          >
            Devis gratuit
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </a>

          {/* Burger — always white on hero (transparent bg), auto color after scroll */}
          <button
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-cta)] active:scale-95"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            style={{
              color: scrolled ? "var(--color-primary)" : "#ffffff",
            }}
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </motion.header>

      {/* ══ MOBILE FULLSCREEN MENU ════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] lg:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel — slides in from top */}
            <motion.div
              id="mobile-menu"
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: "0%" }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed inset-x-0 top-0 z-[80] flex flex-col lg:hidden"
              style={{
                backgroundColor: "var(--color-bg)",
                minHeight: "100svh",
                maxHeight: "100svh",
                overflowY: "auto",
              }}
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between px-5 h-14 shrink-0 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Image
                  src="/logo.png"
                  alt="BaldEngineer"
                  width={110}
                  height={30}
                  className="dark:brightness-0 dark:invert"
                  unoptimized
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-cta)] active:scale-95"
                  style={{
                    color: "var(--color-primary)",
                    backgroundColor: "var(--color-bg-2)",
                  }}
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav
                className="flex-1 flex flex-col justify-center px-8 py-6 gap-1"
                aria-label="Menu mobile"
              >
                {sections.map((s, i) => (
                  <motion.a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="flex items-center justify-between py-4 border-b cursor-pointer group min-h-[56px] transition-all duration-150"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span
                      className="text-[1.65rem] font-bold tracking-tight leading-none transition-colors duration-150"
                      style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        color:
                          active === s.id
                            ? "var(--color-cta)"
                            : "var(--color-primary)",
                      }}
                    >
                      {s.label}
                    </span>
                    <motion.span
                      animate={{ opacity: active === s.id ? 1 : 0, scale: active === s.id ? 1 : 0.5 }}
                      transition={{ duration: 0.18 }}
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: "var(--color-cta)" }}
                    />
                  </motion.a>
                ))}
              </nav>

              {/* Bottom actions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.32 }}
                className="px-8 pb-10 flex flex-col gap-3 shrink-0"
              >
                <a
                  href="tel:0659980688"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl border text-sm font-medium cursor-pointer min-h-[52px] transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{
                    color: "var(--color-cta)",
                    borderColor: "var(--color-cta)",
                    fontFamily: "var(--font-jetbrains), monospace",
                  }}
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  06.59.98.06.88
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-semibold text-white cursor-pointer min-h-[52px] transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: "var(--color-cta)" }}
                >
                  Demander un devis gratuit
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

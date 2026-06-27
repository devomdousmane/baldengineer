"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { MapPin, Phone, Mail, GraduationCap, Briefcase } from "lucide-react";
import SectionHeader from "./SectionHeader";
import AnimatedSection from "./AnimatedSection";

const domains = ["Tertiaire", "Industriel", "Ferroviaire", "Pharmaceutique", "Nucléaire"];
const tools = [
  { name: "AutoCAD",       level: 88 },
  { name: "Caneco BT",     level: 75 },
  { name: "Dialux",        level: 55 },
  { name: "MS Visio",      level: 75 },
  { name: "See Electrical",level: 50 },
];
const diplomas = [
  { year: "2009", label: "BAC+5 – Gestion des Réseaux d'Énergies Électriques", school: "Université Lille 1" },
  { year: "2010", label: "Certification – Production et Distribution des Réseaux Électriques", school: "CNAM Lille" },
];

/* ── Animated progress bar — uses scaleX (GPU, no layout) ──── */
function ProgressBar({ level, delay }: { level: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <div
      ref={ref}
      className="h-1.5 rounded-full overflow-hidden"
      style={{ backgroundColor: "var(--color-border)" }}
    >
      <motion.div
        className="h-full rounded-full origin-left"
        style={{ backgroundColor: "var(--color-cta)" }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: level / 100 } : { scaleX: 0 }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
      />
    </div>
  );
}

export default function About() {
  /* Parallax on the photo */
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="apropos" className="py-20 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="À propos"
          title="Un ingénieur au service de vos performances énergétiques"
          subtitle="Diplômé en ingénierie électrique, j'exerce depuis plus de 15 années dans le domaine des installations électriques CFO/CFA."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* ── Left — Photo + bio ── */}
          <div className="space-y-6">
            {/* Photo with parallax */}
            <AnimatedSection direction="left" delay={0}>
              <div
                ref={photoRef}
                className="relative rounded-2xl overflow-hidden border"
                style={{ borderColor: "var(--color-border)", height: "280px" }}
              >
                <motion.div
                  style={{ y: imgY, willChange: "transform" }}
                  className="absolute inset-x-0 top-[-8%] bottom-[-8%]"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?fm=jpg&q=80&w=900&auto=format&fit=crop"
                    alt="Ingénieur en bureau d'études"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <div
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#2E7D32", fontFamily: "var(--font-jetbrains), monospace" }}
                >
                  Thierno BALDE · Ingénieur CFO/CFA
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.08}>
              <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                Mon parcours m&apos;a permis d&apos;acquérir une solide expérience dans la
                conception de réseaux électriques modernes, tout en intégrant les
                exigences de sécurité, d&apos;efficacité énergétique et de connectivité.
              </p>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.12}>
              <blockquote
                className="border-l-4 pl-5 italic text-base font-medium"
                style={{ borderColor: "var(--color-cta)", color: "var(--color-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}
              >
                &ldquo;Allier innovation, performance et sécurité pour concevoir des installations durables et intelligentes.&rdquo;
              </blockquote>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.16}>
              <div className="space-y-3">
                {[
                  { icon: Phone, text: "06.59.98.06.88",                        href: "tel:0659980688" },
                  { icon: Mail,  text: "thierno.balde@baldengineer.fr",          href: "mailto:thierno.balde@baldengineer.fr" },
                  { icon: MapPin,text: "42 rue Jacques Benoist, 27140 Gisors",   href: null },
                ].map(({ icon: Icon, text, href }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 15%, transparent)" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "var(--color-cta)" }} />
                    </div>
                    {href ? (
                      <a href={href} className="text-sm hover:underline cursor-pointer transition-opacity duration-150 hover:opacity-70" style={{ color: "var(--color-secondary)", fontFamily: "var(--font-jetbrains), monospace" }}>{text}</a>
                    ) : (
                      <span className="text-sm" style={{ color: "var(--color-secondary)", fontFamily: "var(--font-jetbrains), monospace" }}>{text}</span>
                    )}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* ── Right — Cards ── */}
          <div className="space-y-5">
            {/* Domains */}
            <AnimatedSection direction="right" delay={0}>
              <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4" style={{ color: "var(--color-cta)" }} />
                  <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains), monospace", color: "var(--color-muted)" }}>
                    Secteurs d&apos;activité
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {domains.map((d) => (
                    <span
                      key={d}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 12%, transparent)", color: "var(--color-cta)" }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Tools with GPU-accelerated progress bars */}
            <AnimatedSection direction="right" delay={0.08}>
              <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ fontFamily: "var(--font-jetbrains), monospace", color: "var(--color-muted)" }}>
                  Logiciels métier
                </h3>
                <div className="space-y-4">
                  {tools.map((t, i) => (
                    <div key={t.name}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jetbrains), monospace", color: "var(--color-secondary)" }}>
                          {t.name}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
                          {t.level >= 80 ? "Expert" : t.level >= 65 ? "Pro" : "Intermédiaire"}
                        </span>
                      </div>
                      <ProgressBar level={t.level} delay={i * 0.08} />
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Formation */}
            <AnimatedSection direction="right" delay={0.16}>
              <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4" style={{ color: "var(--color-cta)" }} />
                  <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains), monospace", color: "var(--color-muted)" }}>
                    Formation
                  </h3>
                </div>
                <div className="space-y-4">
                  {diplomas.map((d) => (
                    <div key={d.year} className="flex gap-3">
                      <span className="text-xs font-bold shrink-0 mt-0.5 w-10" style={{ color: "var(--color-cta)", fontFamily: "var(--font-jetbrains), monospace" }}>{d.year}</span>
                      <div>
                        <p className="text-sm leading-snug" style={{ color: "var(--color-secondary)" }}>{d.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>{d.school}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}

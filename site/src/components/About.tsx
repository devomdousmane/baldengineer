"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { MapPin, Phone, Mail, GraduationCap, Briefcase } from "lucide-react";
import SectionHeader from "./SectionHeader";
import AnimatedSection from "./AnimatedSection";

const domains = ["Tertiaire", "Industriel", "Ferroviaire", "Pharmaceutique", "Nucléaire"];
const tools = [
  { name: "AutoCAD",        level: 88 },
  { name: "Caneco BT",      level: 75 },
  { name: "Dialux",         level: 55 },
  { name: "MS Visio",       level: 75 },
  { name: "See Electrical", level: 50 },
];
const diplomas = [
  { year: "2009", label: "BAC+5 – Gestion des Réseaux d'Énergies Électriques", school: "Université Lille 1" },
  { year: "2010", label: "Certification – Production et Distribution des Réseaux Électriques", school: "CNAM Lille" },
];

function ProgressBar({ level, delay, label }: { level: number; delay: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <div
      ref={ref}
      className="h-px rounded-full overflow-hidden"
      style={{ backgroundColor: "var(--color-border)" }}
      role="progressbar"
      aria-valuenow={level}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} : ${level}%`}
    >
      <motion.div
        className="h-full rounded-full origin-left"
        style={{ backgroundColor: "var(--color-accent)" }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: level / 100 } : { scaleX: 0 }}
        transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export default function About() {
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="apropos"
      className="py-28 sm:py-36 px-6 sm:px-10"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="À propos"
          title="Un ingénieur au service de vos performances énergétiques"
          subtitle="Diplômé en ingénierie électrique, j'exerce depuis plus de 15 années dans le domaine des installations électriques CFO/CFA."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left — Photo + bio ── */}
          <div className="space-y-8">
            <AnimatedSection direction="left" delay={0}>
              <div
                ref={photoRef}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  height: "320px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-3)",
                }}
              >
                <motion.div
                  style={{ y: imgY, willChange: "transform" }}
                  className="absolute inset-x-0 top-[-8%] bottom-[-8%]"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?fm=jpg&q=80&w=900&auto=format&fit=crop"
                    alt="Thierno BALDE — Ingénieur en bureau d'études"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                <div
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: "var(--color-accent)", fontFamily: "var(--font-mono)" }}
                >
                  Thierno BALDE · CFO/CFA
                </div>
                {/* Gold trait decoration */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ backgroundColor: "var(--color-gold)", opacity: 0.3 }}
                />
              </div>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.08}>
              <p
                className="leading-relaxed"
                style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)", fontSize: "var(--text-base)", lineHeight: 1.75 }}
              >
                Mon parcours m&apos;a permis d&apos;acquérir une solide expérience dans la
                conception de réseaux électriques modernes, tout en intégrant les
                exigences de sécurité, d&apos;efficacité énergétique et de connectivité.
              </p>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.12}>
              <blockquote
                className="border-l-2 pl-6 py-1"
                style={{ borderColor: "var(--color-gold)" }}
              >
                <p
                  className="italic text-lg leading-relaxed"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", fontSize: "1.2rem" }}
                >
                  &ldquo;Allier innovation, performance et sécurité pour concevoir des installations durables et intelligentes.&rdquo;
                </p>
              </blockquote>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.16}>
              <div className="space-y-3">
                {[
                  { icon: Phone, text: "06.59.98.06.88",                      href: "tel:0659980688" },
                  { icon: Mail,  text: "thierno.balde@baldengineer.fr",        href: "mailto:thierno.balde@baldengineer.fr" },
                  { icon: MapPin,text: "42 rue Jacques Benoist, 27140 Gisors", href: null },
                ].map(({ icon: Icon, text, href }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                    {href ? (
                      <a
                        href={href}
                        className="text-sm transition-colors duration-200 hover:text-[var(--color-accent-hi)]"
                        style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                      >
                        {text}
                      </a>
                    ) : (
                      <span className="text-sm" style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}>{text}</span>
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
              <div
                className="rounded-2xl p-6 border"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-2)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                  <h3
                    className="text-[10px] font-medium uppercase tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-2)" }}
                  >
                    Secteurs d&apos;activité
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {domains.map((d) => (
                    <span
                      key={d}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent-hi)", border: "1px solid var(--color-border)" }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Tools */}
            <AnimatedSection direction="right" delay={0.08}>
              <div
                className="rounded-2xl p-6 border"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-2)" }}
              >
                <h3
                  className="text-[10px] font-medium uppercase tracking-[0.2em] mb-5"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-2)" }}
                >
                  Logiciels métier
                </h3>
                <div className="space-y-4">
                  {tools.map((t, i) => (
                    <div key={t.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-2)" }}>
                          {t.name}
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-widest"
                          style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)" }}
                        >
                          {t.level >= 80 ? "Expert" : t.level >= 65 ? "Pro" : "Inter."}
                        </span>
                      </div>
                      <ProgressBar level={t.level} delay={i * 0.08} label={t.name} />
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Formation */}
            <AnimatedSection direction="right" delay={0.16}>
              <div
                className="rounded-2xl p-6 border"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-2)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                  <h3
                    className="text-[10px] font-medium uppercase tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-2)" }}
                  >
                    Formation
                  </h3>
                </div>
                <div className="space-y-5">
                  {diplomas.map((d) => (
                    <div key={d.year} className="flex gap-4">
                      <span
                        className="text-xs font-medium shrink-0 mt-0.5"
                        style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)", minWidth: "2.5rem" }}
                      >
                        {d.year}
                      </span>
                      <div>
                        <p
                          className="text-sm leading-snug mb-0.5 italic"
                          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)", fontSize: "1rem" }}
                        >
                          {d.label}
                        </p>
                        <p
                          className="text-[11px] uppercase tracking-widest"
                          style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                        >
                          {d.school}
                        </p>
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

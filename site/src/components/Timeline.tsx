"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import SectionHeader from "./SectionHeader";

const experiences = [
  {
    period: "06/2023 – Aujourd'hui",
    company: "BERIM",
    role: "Ingénieur d'études en électricité",
    sector: "Tertiaire",
    tasks: [
      "Collèges, École Polytechnique Palaiseau, logements Malakoff",
      "Bilan de puissance, dimensionnement équipements électriques",
      "CCTP CFO/CFA, notes de calcul, plans de cheminement",
      "Suivi de chantier, OPR statiques et dynamiques",
    ],
    current: true,
    duration: "2 ans",
  },
  {
    period: "01/2022 – 06/2023",
    company: "SANOFI",
    role: "Ingénieur d'études en électricité",
    sector: "Industriel · Pharmaceutique",
    tasks: [
      "Travaux neufs / revamping – Suivi de chantier",
      "Études et conception des tableaux de distribution",
      "Schémas de câblage, notes de calcul",
      "Gestion monitoring IV Tracer",
    ],
    current: false,
    duration: "1 an 9 mois",
  },
  {
    period: "02/2021 – 02/2022",
    company: "INEO NUCLÉAIRE",
    role: "Ingénieur d'études en électricité",
    sector: "Nucléaire",
    tasks: [
      "EPR d'Angleterre – environ 800 tableaux de distribution",
      "Schémas de câblage, coffrets et boîtes de jonction",
      "Notes de calcul, carnets de câbles",
      "Schémas électriques d'exécution",
    ],
    current: false,
    duration: "11 mois",
  },
  {
    period: "09/2020 – 02/2021",
    company: "GROUPE ECIA",
    role: "Ingénieur d'études en électricité",
    sector: "Industriel",
    tasks: [
      "Déconstruction site industriel Orano",
      "Remplacement onduleurs/chargeurs/batteries",
      "Synoptique, plan guide, note APD",
    ],
    current: false,
    duration: "6 mois",
  },
  {
    period: "2018 – 2019",
    company: "SMR Champigny",
    role: "Ingénieur d'études",
    sector: "Tertiaire",
    tasks: [
      "Réalisation de plans et synoptiques",
      "Vérifications installations CFO/CFA",
      "Chiffrage projets",
    ],
    current: false,
    duration: "~1 an",
  },
  {
    period: "2017 – 2018",
    company: "Eiffage",
    role: "Ingénieur d'études",
    sector: "Tertiaire",
    tasks: ["Dimensionnement installations CFO/CFA", "Chiffrage, notes d'étude"],
    current: false,
    duration: "~1 an",
  },
  {
    period: "2015 – 2016",
    company: "Technip",
    role: "Ingénieur d'études",
    sector: "Industriel",
    tasks: ["Études d'installations électriques industrielles", "Essais et vérifications sur site"],
    current: false,
    duration: "~2 ans",
  },
];

/* Sector → accent color (CSS token or hex) */
const sectorAccent: Record<string, string> = {
  "Tertiaire":                "var(--color-accent)",
  "Industriel · Pharmaceutique": "#A78BFA",
  "Nucléaire":                "#F87171",
  "Industriel":               "#34D399",
  "Ferroviaire":              "#FBBF24",
};

function TimelineItem({
  exp, index, isLeft,
}: { exp: typeof experiences[0]; index: number; isLeft: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const accent = sectorAccent[exp.sector] ?? "var(--color-accent)";

  return (
    <div
      ref={ref}
      className={`relative flex items-start mb-8 md:mb-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.0, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full md:w-[calc(50%-28px)] rounded-2xl border overflow-hidden transition-all duration-400 ${isLeft ? "mr-auto" : "ml-auto"}`}
        style={{
          borderColor: exp.current ? `${accent}35` : "var(--color-border)",
          backgroundColor: "var(--color-surface)",
          boxShadow: exp.current ? "var(--shadow-3)" : "var(--shadow-2)",
        }}
      >
        {/* Colored top bar */}
        <div className="h-px" style={{ backgroundColor: accent }} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ color: "var(--color-accent-hi)", fontFamily: "var(--font-mono)" }}
            >
              {exp.period}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-[10px] px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${accent}15`,
                  color: accent,
                  fontFamily: "var(--font-mono)",
                  border: `1px solid ${accent}25`,
                }}
              >
                {exp.sector}
              </span>
              {exp.current && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent-hi)", fontFamily: "var(--font-mono)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--color-accent-hi)" }} />
                  En poste
                </span>
              )}
            </div>
          </div>
          <h3
            className="font-light italic text-xl mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            {exp.company}
          </h3>
          <p
            className="text-sm mb-3"
            style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)" }}
          >
            {exp.role}
          </p>
          <ul className="space-y-1.5">
            {exp.tasks.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span
                  className="mt-2 w-1 h-1 rounded-full shrink-0"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)", lineHeight: 1.65 }}
                >
                  {t}
                </span>
              </li>
            ))}
          </ul>
          <p
            className="text-[10px] mt-3 uppercase tracking-widest"
            style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
          >
            Durée : {exp.duration}
          </p>
        </div>
      </motion.div>

      {/* Center dot — desktop */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: index * 0.05 + 0.2 }}
        className="hidden md:flex absolute left-1/2 top-5 -translate-x-1/2 w-8 h-8 rounded-full items-center justify-center z-10 border"
        style={{
          backgroundColor: exp.current ? accent : "var(--color-surface)",
          borderColor: exp.current ? accent : "var(--color-border-solid)",
          boxShadow: exp.current ? `0 0 16px ${accent}40` : "none",
        }}
        aria-hidden="true"
      >
        <span
          className="text-[10px] font-medium"
          style={{
            color: exp.current ? "#fff" : "var(--color-text-2)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {exp.period.slice(0, 2)}
        </span>
      </motion.div>
    </div>
  );
}

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 80%", "end 20%"] });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      className="py-28 sm:py-36 px-6 sm:px-10"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Expérience"
          title="Parcours professionnel"
          subtitle="Plus de 15 ans d'expertise au service de projets électriques d'envergure — tertiaire, industriel, nucléaire, ferroviaire."
        />

        <div ref={containerRef} className="relative">
          {/* Animated timeline line */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px"
            style={{ backgroundColor: "var(--color-border-solid)" }}
            aria-hidden="true"
          >
            <motion.div
              className="absolute inset-0 origin-top"
              style={{
                scaleY: lineScaleY,
                background: "linear-gradient(to bottom, var(--color-accent), var(--color-accent-hi))",
                willChange: "transform",
              }}
            />
          </div>

          <div className="space-y-0 md:space-y-10">
            {experiences.map((exp, i) => (
              <TimelineItem
                key={exp.company + exp.period}
                exp={exp}
                index={i}
                isLeft={i % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

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
      "Collèges, Ecole Polytechnique Palaiseau, logements Malakoff",
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
    tasks: [
      "Dimensionnement installations CFO/CFA",
      "Chiffrage, notes d'étude",
    ],
    current: false,
    duration: "~1 an",
  },
  {
    period: "2015 – 2016",
    company: "Technip",
    role: "Ingénieur d'études",
    sector: "Industriel",
    tasks: [
      "Études d'installations électriques industrielles",
      "Essais et vérifications sur site",
    ],
    current: false,
    duration: "~2 ans",
  },
];

const sectorColors: Record<string, string> = {
  "Tertiaire": "#0369A1",
  "Industriel · Pharmaceutique": "#7C3AED",
  "Nucléaire": "#DC2626",
  "Industriel": "#059669",
  "Ferroviaire": "#D97706",
};

function TimelineItem({ exp, index, isLeft }: { exp: typeof experiences[0]; index: number; isLeft: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const sectorColor = sectorColors[exp.sector] ?? "#0369A1";

  return (
    <div ref={ref} className={`relative flex items-start mb-8 md:mb-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -32 : 32 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.45, delay: index * 0.04, ease: "easeOut" }}
        className={`w-full md:w-[calc(50%-28px)] rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-lg cursor-default ${isLeft ? "mr-auto" : "ml-auto"}`}
        style={{ borderColor: exp.current ? `${sectorColor}40` : "var(--color-border)", backgroundColor: "var(--color-card)" }}
      >
        {/* Top bar */}
        <div className="h-1" style={{ backgroundColor: sectorColor }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-xs font-medium" style={{ color: "var(--color-cta)", fontFamily: "var(--font-jetbrains), monospace" }}>
              {exp.period}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${sectorColor}18`, color: sectorColor, fontFamily: "var(--font-jetbrains), monospace" }}>
                {exp.sector}
              </span>
              {exp.current && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  En poste
                </span>
              )}
            </div>
          </div>
          <h3 className="font-bold text-base mb-0.5" style={{ fontFamily: "var(--font-space-grotesk), sans-serif", color: "var(--color-primary)" }}>
            {exp.company}
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>{exp.role}</p>
          <ul className="space-y-1.5">
            {exp.tasks.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sectorColor }} />
                <span className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>{t}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs mt-3" style={{ color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
            Durée : {exp.duration}
          </p>
        </div>
      </motion.div>

      {/* Center dot — desktop */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: index * 0.04 + 0.18 }}
        className="hidden md:flex absolute left-1/2 top-5 -translate-x-1/2 w-10 h-10 rounded-full items-center justify-center z-10 border-4"
        style={{ backgroundColor: exp.current ? sectorColor : "var(--color-card)", borderColor: exp.current ? sectorColor : "var(--color-border)" }}
      >
        <span className="text-xs font-bold" style={{ color: exp.current ? "#fff" : "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
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
    <section id="experience" className="py-20 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: "var(--color-bg-2)" }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Expérience"
          title="Parcours professionnel"
          subtitle="Plus de 15 ans d'expertise au service de projets électriques d'envergure — tertiaire, industriel, nucléaire, ferroviaire."
        />

        <div ref={containerRef} className="relative">
          {/* Animated timeline line — desktop (scaleY = GPU, no layout) */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px"
            style={{ backgroundColor: "var(--color-border)" }}
          >
            <motion.div
              className="absolute inset-0 origin-top"
              style={{ scaleY: lineScaleY, backgroundColor: "var(--color-cta)", willChange: "transform" }}
            />
          </div>

          <div className="space-y-0 md:space-y-10">
            {experiences.map((exp, i) => (
              <TimelineItem key={exp.company + exp.period} exp={exp} index={i} isLeft={i % 2 === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

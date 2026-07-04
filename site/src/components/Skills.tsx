"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Settings, FileText, Search, Users, Cpu, Calculator,
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import AnimatedSection from "./AnimatedSection";
import { SectionTexture } from "./SectionTexture";

const skills = [
  {
    icon: Users,
    title: "Coordination & pilotage",
    desc: "Coordination et pilotage d'études pluridisciplinaires avec les différents corps d'état.",
  },
  {
    icon: Settings,
    title: "Conception HT/BT",
    desc: "Conception d'installations haute et basse tension : schémas, plans, synoptiques.",
  },
  {
    icon: Calculator,
    title: "Notes de calcul",
    desc: "Réalisation de notes de calcul électriques (bilan de puissance, court-circuit, chute de tension).",
  },
  {
    icon: FileText,
    title: "Rédaction technique",
    desc: "Rédaction de CCTP, spécifications techniques, dossiers de consultation des entreprises.",
  },
  {
    icon: Search,
    title: "Consultation fournisseurs",
    desc: "Analyse d'offres techniques et commerciales, négociation et sélection des équipements.",
  },
  {
    icon: Cpu,
    title: "Dimensionnement",
    desc: "Dimensionnement des équipements électriques selon les normes NF C 15-100 et HTA.",
  },
];

function SkillCard({
  icon: Icon, title, desc, index,
}: { icon: typeof Settings; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-2xl p-6 border cursor-default transition-all duration-500"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: "var(--shadow-2)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-3)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.01)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hi)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-2)";
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
      role="article"
      aria-label={title}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
        style={{ backgroundColor: "var(--color-accent-dim)", border: "1px solid var(--color-border)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
      </div>
      <h3
        className="font-medium text-base mb-3 leading-snug"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--color-text)", fontSize: "1.15rem" }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section
      id="competences"
      className="relative py-28 sm:py-36 px-6 sm:px-10"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <SectionTexture glow="top-left" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionHeader
          label="Compétences"
          title="Savoir-faire technique"
          subtitle="Une expertise complète couvrant l'ensemble du cycle de vie de vos projets électriques, de la conception à la mise en service."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill, i) => (
            <SkillCard key={skill.title} {...skill} index={i} />
          ))}
        </div>

        {/* Certifications bar */}
        <AnimatedSection delay={0.2} className="mt-10">
          <div
            className="rounded-2xl p-6 sm:p-8 border flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--color-accent-dim)", border: "1px solid var(--color-border)" }}
              aria-hidden="true"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div>
              <h3
                className="font-medium text-lg mb-2 italic"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                Conformité & normes
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}
              >
                Mise en conformité NF C 15-100, habilitations électriques, normes HTA/HTB.
                Intégration des solutions connectées : GTB, domotique, supervision.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

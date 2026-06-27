"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Settings,
  FileText,
  Search,
  Users,
  Cpu,
  Calculator,
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import AnimatedSection from "./AnimatedSection";

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
  icon: Icon,
  title,
  desc,
  index,
}: {
  icon: typeof Settings;
  title: string;
  desc: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
      className="group rounded-2xl p-6 border cursor-default transition-shadow duration-200 hover:shadow-md"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200"
        style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 12%, var(--color-card))" }}
      >
        <Icon
          className="w-5 h-5 transition-colors duration-200 group-hover:text-white"
          style={{ color: "var(--color-cta)" }}
        />
      </div>
      <h3
        className="font-semibold text-base mb-2"
        style={{ fontFamily: "var(--font-archivo), sans-serif", color: "var(--color-primary)" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {desc}
      </p>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section
      id="competences"
      className="py-20 sm:py-28 px-4 sm:px-6"
      style={{ backgroundColor: "var(--color-bg-2)" }}
    >
      <div className="max-w-7xl mx-auto">
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
        <AnimatedSection delay={0.2} className="mt-12">
          <div
            className="rounded-2xl p-6 sm:p-8 border flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 12%, var(--color-card))" }}
            >
              <Award className="w-7 h-7" style={{ color: "var(--color-cta)" }} />
            </div>
            <div>
              <h3
                className="font-semibold text-lg mb-1"
                style={{ fontFamily: "var(--font-archivo), sans-serif", color: "var(--color-primary)" }}
              >
                Conformité & normes
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Award({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

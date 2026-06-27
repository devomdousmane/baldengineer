"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

const projects = [
  {
    category: "Tertiaire",
    title: "Ancien siège Niemeyer – Saint-Denis",
    image: "https://images.unsplash.com/photo-1581092157699-83c90752400a?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Bâtiment tertiaire chantier électrique",
    color: "#2E7D32",
    items: [
      "Étude et réalisation CFO/CFA complète",
      "Installation réseaux électriques et vidéosurveillance",
      "GTB pour gestion énergétique",
      "Bilan de puissance, dimensionnement équipements",
    ],
  },
  {
    category: "Tertiaire",
    title: "Immeuble de bureaux – Bruix, Porte Maillot",
    image: "https://images.unsplash.com/photo-1462396240927-52058a6a84ec?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Immeuble de bureaux moderne",
    color: "#1565C0",
    items: [
      "Étude et réalisation CFO/CFA",
      "Plans de cheminement, synoptiques",
      "Installation réseaux et vidéosurveillance",
      "GTB pour gestion énergétique",
    ],
  },
  {
    category: "Résidentiel",
    title: "Villa connectée – 2022",
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Smart home domotique",
    color: "#7B1FA2",
    items: [
      "Installation domotique complète",
      "Réseau Wi-Fi et vidéo IP haute définition",
      "Gestion à distance via smartphone",
    ],
  },
  {
    category: "Nucléaire",
    title: "EPR Angleterre – INEO Nucléaire",
    image: "https://images.unsplash.com/photo-1563456019560-2b37aa7ad890?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Armoire électrique industrielle",
    color: "#D32F2F",
    items: [
      "~800 tableaux de distribution conçus",
      "Schémas électriques d'exécution",
      "Notes de calcul, carnets de câbles",
    ],
  },
  {
    category: "Éducation",
    title: "Collèges & École Polytechnique – BERIM",
    image: "https://images.unsplash.com/photo-1481026469463-66327c86e544?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Bâtiment scolaire",
    color: "#E65100",
    items: [
      "Dannemarie, Moussy-le-Neuf, Coubert",
      "CCTP CFO/CFA, notes de calcul",
      "Suivi chantier, OPR statiques et dynamiques",
    ],
  },
  {
    category: "Pharmaceutique",
    title: "SANOFI – Réaménagement site",
    image: "https://plus.unsplash.com/premium_photo-1683121713210-97667d2e83c8?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Laboratoire pharmaceutique industriel",
    color: "#00838F",
    items: [
      "Travaux neufs / revamping",
      "Tableaux de distribution, schémas câblage",
      "Gestion monitoring IV Tracer",
    ],
  },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  /* Subtle parallax on card image */
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cardScroll } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const imgShift = useTransform(cardScroll, [0, 1], ["-6%", "6%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08, ease: "easeOut" }}
      className="group rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-lg cursor-default"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
    >
      {/* Photo with parallax */}
      <div ref={cardRef} className="relative h-44 overflow-hidden">
        <motion.div
          style={{ y: imgShift, willChange: "transform" }}
          className="absolute inset-x-0 top-[-8%] bottom-[-8%]"
        >
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            unoptimized
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span
          className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-white"
          style={{ backgroundColor: project.color, fontFamily: "var(--font-jetbrains), monospace" }}
        >
          {project.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-sm mb-3 leading-snug" style={{ fontFamily: "var(--font-space-grotesk), sans-serif", color: "var(--color-primary)" }}>
          {project.title}
        </h3>
        <ul className="space-y-1.5">
          {project.items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: project.color }} />
              <span className="text-xs leading-relaxed" style={{ color: "var(--color-secondary)" }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Realisations() {
  const valRef = useRef<HTMLDivElement>(null);
  const valInView = useInView(valRef, { once: true, margin: "-8% 0px" });

  return (
    <section id="realisations" className="py-20 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: "var(--color-bg-2)" }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Réalisations"
          title="Projets réalisés"
          subtitle="Des missions d'envergure menées avec rigueur, de la conception à la mise en service."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>

        {/* Valeurs */}
        <div ref={valRef}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={valInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="rounded-2xl p-6 sm:p-8 border"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
          >
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
              Engagement qualité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {["Respect des délais et des normes", "Études sur mesure selon les besoins", "Solutions innovantes et durables"].map((v, i) => (
                <motion.div
                  key={v}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={valInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 10%, transparent)", border: "1px solid var(--color-border)" }}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--color-cta)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>{v}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

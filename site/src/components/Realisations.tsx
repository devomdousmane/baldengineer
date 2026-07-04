"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { SectionTexture } from "./SectionTexture";

const projects = [
  {
    category: "Tertiaire",
    title: "Ancien siège Niemeyer – Saint-Denis",
    image: "https://images.unsplash.com/photo-1581092157699-83c90752400a?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Bâtiment tertiaire chantier électrique",
    accent: "var(--color-accent)",
    items: ["Étude et réalisation CFO/CFA complète", "Réseaux électriques et vidéosurveillance", "GTB pour gestion énergétique"],
  },
  {
    category: "Tertiaire",
    title: "Immeuble de bureaux – Bruix, Porte Maillot",
    image: "https://images.unsplash.com/photo-1462396240927-52058a6a84ec?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Immeuble de bureaux moderne",
    accent: "#60A5FA",
    items: ["Étude et réalisation CFO/CFA", "Plans de cheminement, synoptiques", "GTB pour gestion énergétique"],
  },
  {
    category: "Résidentiel",
    title: "Villa connectée – 2022",
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Smart home domotique",
    accent: "#A78BFA",
    items: ["Installation domotique complète", "Réseau Wi-Fi et vidéo IP HD", "Gestion à distance via smartphone"],
  },
  {
    category: "Nucléaire",
    title: "EPR Angleterre – INEO Nucléaire",
    image: "https://images.unsplash.com/photo-1563456019560-2b37aa7ad890?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Armoire électrique industrielle",
    accent: "#F87171",
    items: ["~800 tableaux de distribution conçus", "Schémas électriques d'exécution", "Notes de calcul, carnets de câbles"],
  },
  {
    category: "Éducation",
    title: "Collèges & École Polytechnique – BERIM",
    image: "https://images.unsplash.com/photo-1481026469463-66327c86e544?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Bâtiment scolaire",
    accent: "#FB923C",
    items: ["Dannemarie, Moussy-le-Neuf, Coubert", "CCTP CFO/CFA, notes de calcul", "Suivi chantier, OPR"],
  },
  {
    category: "Pharmaceutique",
    title: "SANOFI – Réaménagement site",
    image: "https://plus.unsplash.com/premium_photo-1683121713210-97667d2e83c8?fm=jpg&q=80&w=800&auto=format&fit=crop",
    imageAlt: "Laboratoire pharmaceutique industriel",
    accent: "#2DD4BF",
    items: ["Travaux neufs / revamping", "Tableaux de distribution, câblage", "Gestion monitoring IV Tracer"],
  },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const imgShift = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-2xl border overflow-hidden transition-all duration-500 cursor-default"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: "var(--shadow-2)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-3)";
        (e.currentTarget as HTMLElement).style.borderColor = project.accent;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-2)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
      role="article"
      aria-label={`Projet : ${project.title}`}
    >
      {/* Photo */}
      <div ref={cardRef} className="relative h-44 overflow-hidden">
        <motion.div
          style={{ y: imgShift, willChange: "transform" }}
          className="absolute inset-x-0 top-[-8%] bottom-[-8%]"
        >
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04] grayscale group-hover:grayscale-0"
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        {/* Accent line top */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: project.accent, opacity: 0.7 }} />
        <span
          className="absolute bottom-3 left-3 px-2 py-1 rounded text-[10px] font-medium text-white"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", fontFamily: "var(--font-mono)", border: `1px solid ${project.accent}40` }}
        >
          {project.category}
        </span>
      </div>

      <div className="p-5">
        <h3
          className="font-light italic text-base mb-3 leading-snug"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", fontSize: "1.1rem" }}
        >
          {project.title}
        </h3>
        <ul className="space-y-2">
          {project.items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2
                className="w-3.5 h-3.5 mt-0.5 shrink-0"
                style={{ color: project.accent }}
                strokeWidth={1.5}
              />
              <span
                className="text-xs leading-relaxed"
                style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)", lineHeight: 1.6 }}
              >
                {item}
              </span>
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
    <section
      id="realisations"
      className="relative py-28 sm:py-36 px-6 sm:px-10"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <SectionTexture glow="top-left" />
      <div className="relative z-10 max-w-7xl mx-auto">
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

        {/* Engagement qualité */}
        <div ref={valRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={valInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-6 sm:p-8 border"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-2)" }}
          >
            <p
              className="text-center text-[10px] font-medium uppercase tracking-[0.2em] mb-6"
              style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
            >
              Engagement qualité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {[
                "Respect des délais et des normes",
                "Études sur mesure selon les besoins",
                "Solutions innovantes et durables",
              ].map((v, i) => (
                <motion.div
                  key={v}
                  initial={{ opacity: 0, y: 12 }}
                  animate={valInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "var(--color-accent-dim)", border: "1px solid var(--color-border)" }}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  >
                    {v}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

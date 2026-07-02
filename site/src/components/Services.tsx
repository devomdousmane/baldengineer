"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Wifi, Shield, Cpu, Building2, CheckCircle2, MonitorSmartphone, Network } from "lucide-react";
import SectionHeader from "./SectionHeader";

const services = [
  {
    category: "CFO — Courants Forts",
    icon: Zap,
    color: "var(--color-accent)",
    colorRaw: "#2D8A3E",
    items: [
      "Études et conception de réseaux BT et HTA",
      "Tableaux de distribution, protections, appareillage",
      "Installation et maintenance d'éclairage intérieur/extérieur",
      "Groupes électrogènes, onduleurs, continuité de service",
      "Mise à la terre, parafoudre, sécurité électrique",
      "Optimisation énergétique et audits techniques",
    ],
    tagline: "NF C 15-100 · HTA/BT · Bilan de puissance",
  },
  {
    category: "CFA — Courants Faibles",
    icon: Wifi,
    color: "#60A5FA",
    colorRaw: "#60A5FA",
    items: [
      "Réseaux informatiques (cuivre Cat6A, fibre optique, Wi-Fi)",
      "Téléphonie, interphonie et visiophonie",
      "Vidéosurveillance CCTV IP, enregistrement, supervision",
      "Alarme intrusion, détection incendie, contrôle d'accès",
      "Gestion technique du bâtiment (GTB / GTC)",
      "Domotique et automatisation intelligente",
    ],
    tagline: "BACnet · MODBUS · Fibre SM/MM · PoE",
  },
];

const sectors = [
  { icon: Building2,      label: "Tertiaire",      desc: "Bureaux, sièges sociaux" },
  { icon: Cpu,            label: "Industriel",      desc: "Usines, data centers" },
  { icon: Shield,         label: "Ferroviaire",     desc: "Gares, signalisation" },
  { icon: Zap,            label: "Pharmaceutique",  desc: "Salles propres, labos" },
  { icon: MonitorSmartphone, label: "Domotique",   desc: "Villas connectées" },
  { icon: Network,        label: "Nucléaire",       desc: "Centrales, EPR" },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      {/* Header */}
      <div
        className="p-6 pb-5 border-b"
        style={{
          borderColor: "var(--color-border)",
          background: `linear-gradient(135deg, var(--color-elevated) 0%, var(--color-surface) 100%)`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-accent-dim)", border: "1px solid var(--color-border)" }}
          >
            <Icon className="w-5 h-5" style={{ color: service.color }} strokeWidth={1.5} />
          </div>
          <h3
            className="font-light italic text-xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
          >
            {service.category}
          </h3>
        </div>
        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
        >
          // {service.tagline}
        </p>
      </div>

      {/* Items */}
      <div className="p-6">
        <ul className="space-y-3">
          {service.items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2
                className="w-4 h-4 mt-0.5 shrink-0"
                style={{ color: service.color }}
                strokeWidth={1.5}
              />
              <span
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)", lineHeight: 1.65 }}
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

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <section
      id="services"
      className="py-28 sm:py-36 px-6 sm:px-10"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Services"
          title="Expertise CFO & CFA"
          subtitle="Conception, installation et maintenance de vos installations électriques et numériques pour tous types de bâtiments."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {services.map((s, i) => (
            <ServiceCard key={s.category} service={s} index={i} />
          ))}
        </div>

        {/* Sectors */}
        <div ref={ref}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center text-[10px] font-medium mb-8 uppercase tracking-[0.2em]"
            style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
          >
            Secteurs d&apos;intervention
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {sectors.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-xl p-4 text-center border transition-all duration-300 cursor-default"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    boxShadow: "var(--shadow-1)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-2)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-1)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                    (e.currentTarget as HTMLElement).style.transform = "";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: "var(--color-accent-dim)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                  </div>
                  <div
                    className="font-medium text-xs mb-0.5 italic"
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-display)", fontSize: "0.95rem" }}
                  >
                    {s.label}
                  </div>
                  <div
                    className="text-[11px] leading-tight"
                    style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)" }}
                  >
                    {s.desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

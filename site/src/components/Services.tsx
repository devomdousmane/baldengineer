"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Zap, Wifi, Shield, Cpu, Building2, CheckCircle2, MonitorSmartphone, Network } from "lucide-react";
import SectionHeader from "./SectionHeader";

const services = [
  {
    category: "CFO — Courants Forts",
    icon: Zap,
    color: "#2E7D32",
    image: "https://images.unsplash.com/photo-1566417110090-6b15a06ec800?fm=jpg&q=80&w=900&auto=format&fit=crop",
    imageAlt: "Tableau électrique industriel TGBT",
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
    color: "#1565C0",
    image: "https://images.unsplash.com/photo-1558054665-fbe00cd7d920?fm=jpg&q=80&w=900&auto=format&fit=crop",
    imageAlt: "Réseau informatique et câblage structuré",
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
  { icon: Building2, label: "Tertiaire", desc: "Bureaux, sièges sociaux, commerces" },
  { icon: Cpu, label: "Industriel", desc: "Usines, ateliers, data centers" },
  { icon: Shield, label: "Ferroviaire", desc: "Gares, tunnels, signalisation" },
  { icon: Zap, label: "Pharmaceutique", desc: "Salles propres, laboratoires" },
  { icon: MonitorSmartphone, label: "Domotique", desc: "Villas connectées, smart home" },
  { icon: Network, label: "Nucléaire", desc: "Centrales, EPR, armoires" },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
      className="rounded-2xl border overflow-hidden group"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
    >
      {/* Photo */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={service.image}
          alt={service.imageAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: service.color }}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-white text-lg" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
              {service.category}
            </h3>
          </div>
        </div>
        <div className="absolute top-4 right-4 px-2 py-1 rounded text-xs" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#a0a0a0", fontFamily: "var(--font-jetbrains), monospace" }}>
          {service.tagline.split(" · ")[0]}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <ul className="space-y-2.5 mb-5">
          {service.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: service.color }} />
              <span className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs pt-4 border-t" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
          // {service.tagline}
        </p>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <section id="services" className="py-20 sm:py-28 px-4 sm:px-6" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Services"
          title="Expertise CFO & CFA"
          subtitle="Conception, installation et maintenance de vos installations électriques et numériques pour tous types de bâtiments."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          {services.map((s, i) => (
            <ServiceCard key={s.category} service={s} index={i} />
          ))}
        </div>

        {/* Sectors grid */}
        <div ref={ref}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-center text-xs font-medium mb-6 uppercase tracking-widest"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}
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
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-xl p-4 text-center border transition-shadow duration-200 hover:shadow-md cursor-default"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 12%, transparent)" }}>
                    <Icon className="w-4 h-4" style={{ color: "var(--color-cta)" }} />
                  </div>
                  <div className="font-semibold text-xs mb-0.5" style={{ color: "var(--color-primary)", fontFamily: "var(--font-space-grotesk), sans-serif" }}>{s.label}</div>
                  <div className="text-xs leading-tight" style={{ color: "var(--color-muted)" }}>{s.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

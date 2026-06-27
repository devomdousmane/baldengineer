"use client";

import { motion } from "framer-motion";

export default function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <pattern id="heroGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1E3A5F" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0369A1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        <rect width="500" height="420" fill="url(#heroGrid)" />

        {/* Glow circles */}
        <circle cx="250" cy="210" r="160" fill="url(#glow1)" />
        <circle cx="350" cy="130" r="80" fill="url(#glow2)" />

        {/* Main circuit board outline */}
        <rect x="80" y="80" width="340" height="260" rx="8" stroke="#1E3A5F" strokeWidth="1" fill="none" />

        {/* Horizontal bus lines */}
        <line x1="80" y1="150" x2="420" y2="150" stroke="#0369A1" strokeWidth="1.5" opacity="0.6" />
        <line x1="80" y1="210" x2="420" y2="210" stroke="#0369A1" strokeWidth="1.5" opacity="0.4" />
        <line x1="80" y1="270" x2="420" y2="270" stroke="#0369A1" strokeWidth="1.5" opacity="0.3" />

        {/* Vertical connectors */}
        {[120, 170, 220, 270, 320, 370].map((x) => (
          <line key={x} x1={x} y1="80" x2={x} y2="340" stroke="#1E3A5F" strokeWidth="0.8" opacity="0.5" />
        ))}

        {/* Component blocks */}
        {/* Transformer */}
        <rect x="100" y="118" width="48" height="64" rx="3" stroke="#38BDF8" strokeWidth="1.5" fill="#0F172A" />
        <circle cx="116" cy="145" r="10" stroke="#38BDF8" strokeWidth="1.2" fill="none" />
        <circle cx="132" cy="145" r="10" stroke="#38BDF8" strokeWidth="1.2" fill="none" />
        <text x="124" y="170" textAnchor="middle" fontSize="7" fill="#38BDF8" fontFamily="JetBrains Mono, monospace">TR 630kVA</text>

        {/* TGBT */}
        <rect x="192" y="112" width="60" height="76" rx="3" stroke="#0369A1" strokeWidth="1.5" fill="#0F172A" />
        <text x="222" y="130" textAnchor="middle" fontSize="7.5" fill="#7DD3FC" fontFamily="JetBrains Mono, monospace" fontWeight="600">TGBT</text>
        <line x1="202" y1="138" x2="242" y2="138" stroke="#0369A1" strokeWidth="2" />
        {[205, 215, 225, 235].map((x) => (
          <g key={x}>
            <line x1={x} y1="138" x2={x} y2="150" stroke="#0369A1" strokeWidth="1" />
            <rect x={x - 4} y="150" width="8" height="5" rx="1" stroke="#0369A1" strokeWidth="0.8" fill="none" />
          </g>
        ))}
        <text x="222" y="178" textAnchor="middle" fontSize="6.5" fill="#475569" fontFamily="JetBrains Mono, monospace">400V – 1250A</text>

        {/* GTB controller */}
        <rect x="308" y="118" width="60" height="44" rx="3" stroke="#D97706" strokeWidth="1.2" fill="#0F172A" />
        <text x="338" y="136" textAnchor="middle" fontSize="7.5" fill="#FBBF24" fontFamily="JetBrains Mono, monospace">GTB</text>
        <text x="338" y="149" textAnchor="middle" fontSize="6.5" fill="#92400E" fontFamily="JetBrains Mono, monospace">BACnet IP</text>

        {/* Sub-panels row */}
        {[
          { x: 100, label: "TD Éclairage", color: "#F59E0B" },
          { x: 192, label: "TD Prises", color: "#10B981" },
          { x: 284, label: "TD CVC", color: "#6366F1" },
          { x: 362, label: "TD SSI", color: "#EF4444" },
        ].map((panel) => (
          <g key={panel.x}>
            <rect x={panel.x} y="238" width="64" height="36" rx="2" stroke={panel.color} strokeWidth="1" fill="none" />
            <text x={panel.x + 32} y="253" textAnchor="middle" fontSize="6.5" fill={panel.color} fontFamily="JetBrains Mono, monospace">{panel.label}</text>
            <line x1={panel.x + 32} y1="210" x2={panel.x + 32} y2="238" stroke={panel.color} strokeWidth="1" strokeDasharray="3,2" />
          </g>
        ))}

        {/* Data flow arrows animated */}
        {[
          { x1: 148, y1: 150, x2: 192, y2: 150 },
          { x1: 252, y1: 150, x2: 308, y2: 136 },
        ].map((line, i) => (
          <line
            key={i}
            x1={line.x1} y1={line.y1}
            x2={line.x2} y2={line.y2}
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="6,3"
          />
        ))}

        {/* Signal dots */}
        {[
          { cx: 156, cy: 150, color: "#38BDF8" },
          { cx: 338, cy: 165, color: "#FBBF24" },
          { cx: 132, cy: 258, color: "#10B981" },
          { cx: 316, cy: 258, color: "#EF4444" },
        ].map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r="4" fill={dot.color} opacity="0.8" />
        ))}

        {/* Dimensions lines */}
        <line x1="80" y1="360" x2="420" y2="360" stroke="#1E3A5F" strokeWidth="0.8" />
        <line x1="80" y1="355" x2="80" y2="365" stroke="#1E3A5F" strokeWidth="0.8" />
        <line x1="420" y1="355" x2="420" y2="365" stroke="#1E3A5F" strokeWidth="0.8" />
        <text x="250" y="375" textAnchor="middle" fontSize="7" fill="#334155" fontFamily="JetBrains Mono, monospace">PLAN DE PRINCIPE – INSTALLATION ÉLECTRIQUE BT</text>
        <text x="250" y="386" textAnchor="middle" fontSize="6.5" fill="#475569" fontFamily="JetBrains Mono, monospace">BaldEngineer | Thierno BALDE | Ind. A</text>

        {/* Corner marks */}
        <path d="M80,80 L95,80 M80,80 L80,95" stroke="#0369A1" strokeWidth="1.5" />
        <path d="M420,80 L405,80 M420,80 L420,95" stroke="#0369A1" strokeWidth="1.5" />
        <path d="M80,340 L95,340 M80,340 L80,325" stroke="#0369A1" strokeWidth="1.5" />
        <path d="M420,340 L405,340 M420,340 L420,325" stroke="#0369A1" strokeWidth="1.5" />
      </svg>

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #38BDF820, #38BDF850, #38BDF820, transparent)" }}
        animate={{ top: ["15%", "85%", "15%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blinking cursor dots */}
      <motion.div
        className="absolute top-[35%] left-[30%] w-2 h-2 rounded-full"
        style={{ backgroundColor: "#38BDF8" }}
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="absolute top-[50%] left-[68%] w-2 h-2 rounded-full"
        style={{ backgroundColor: "#FBBF24" }}
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
      />
      <motion.div
        className="absolute top-[62%] left-[26%] w-2 h-2 rounded-full"
        style={{ backgroundColor: "#10B981" }}
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
      />
    </div>
  );
}

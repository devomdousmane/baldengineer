"use client";

export default function SchemaElec({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
        </pattern>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#0369A1" />
        </marker>
      </defs>
      <rect width="480" height="320" fill="url(#grid)" />

      {/* HTA transformer block */}
      <rect x="20" y="100" width="60" height="80" rx="4" stroke="#0369A1" strokeWidth="1.5" fill="none" />
      <text x="50" y="132" textAnchor="middle" fontSize="8" fill="#0369A1" fontFamily="JetBrains Mono, monospace">HTA</text>
      <text x="50" y="144" textAnchor="middle" fontSize="7" fill="#64748B" fontFamily="JetBrains Mono, monospace">20kV</text>
      {/* Transformer symbol */}
      <circle cx="42" cy="158" r="10" stroke="#0369A1" strokeWidth="1.2" fill="none" />
      <circle cx="58" cy="158" r="10" stroke="#0369A1" strokeWidth="1.2" fill="none" />
      <text x="50" y="188" textAnchor="middle" fontSize="7" fill="#475569" fontFamily="JetBrains Mono, monospace">TR</text>

      {/* Line HTA → TGBT */}
      <line x1="80" y1="140" x2="130" y2="140" stroke="#0369A1" strokeWidth="2" markerEnd="url(#arrow)" />
      <text x="105" y="135" textAnchor="middle" fontSize="7" fill="#64748B" fontFamily="JetBrains Mono, monospace">BT 400V</text>

      {/* TGBT */}
      <rect x="130" y="100" width="80" height="80" rx="4" stroke="#334155" strokeWidth="1.5" fill="none" />
      <text x="170" y="128" textAnchor="middle" fontSize="8" fontWeight="600" fill="#334155" fontFamily="JetBrains Mono, monospace">TGBT</text>
      {/* Bus bar */}
      <line x1="145" y1="145" x2="195" y2="145" stroke="#334155" strokeWidth="2.5" />
      {/* Breakers */}
      {[150, 162, 174, 186].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="145" x2={x} y2="162" stroke="#334155" strokeWidth="1.2" />
          <rect x={x - 4} y="162" width="8" height="6" rx="1" stroke="#334155" strokeWidth="1" fill="none" />
        </g>
      ))}

      {/* Distribution lines */}
      <line x1="210" y1="140" x2="270" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow)" />
      <line x1="210" y1="140" x2="270" y2="140" stroke="#475569" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow)" />
      <line x1="210" y1="140" x2="270" y2="180" stroke="#475569" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow)" />
      <line x1="210" y1="140" x2="270" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow)" />

      {/* Sub-panels */}
      {[
        { y: 70, label: "TD Éclairage", sub: "P=15kW" },
        { y: 110, label: "TD Prises", sub: "P=30kW" },
        { y: 150, label: "TD CVC", sub: "P=45kW" },
        { y: 190, label: "TD Sécurité", sub: "P=10kW" },
      ].map((panel, i) => (
        <g key={i}>
          <rect x="270" y={panel.y} width="70" height="36" rx="3" stroke="#0369A1" strokeWidth="1" fill="none" />
          <text x="305" y={panel.y + 13} textAnchor="middle" fontSize="7" fill="#334155" fontFamily="JetBrains Mono, monospace">{panel.label}</text>
          <text x="305" y={panel.y + 25} textAnchor="middle" fontSize="7" fill="#64748B" fontFamily="JetBrains Mono, monospace">{panel.sub}</text>
        </g>
      ))}

      {/* Terminal loads */}
      {[
        { y: 82, x: 380, icon: "💡", label: "Luminaires" },
        { y: 122, x: 380, icon: "⚡", label: "Bureautique" },
        { y: 162, x: 380, icon: "❄", label: "CTA/CVC" },
        { y: 202, x: 380, icon: "🔒", label: "Alarme" },
      ].map((load, i) => (
        <g key={i}>
          <line x1="340" y1={load.y + 6} x2="370" y2={load.y + 6} stroke="#94A3B8" strokeWidth="1" markerEnd="url(#arrow)" />
          <rect x="370" y={load.y - 2} width="70" height="16" rx="2" stroke="#94A3B8" strokeWidth="0.8" fill="none" />
          <text x="405" y={load.y + 9} textAnchor="middle" fontSize="7" fill="#64748B" fontFamily="JetBrains Mono, monospace">{load.label}</text>
        </g>
      ))}

      {/* Legend */}
      <rect x="20" y="240" width="180" height="60" rx="4" stroke="#E2E8F0" strokeWidth="1" fill="none" />
      <text x="30" y="257" fontSize="8" fontWeight="600" fill="#334155" fontFamily="JetBrains Mono, monospace">LÉGENDE</text>
      <line x1="30" y1="267" x2="50" y2="267" stroke="#0369A1" strokeWidth="2" />
      <text x="55" y="270" fontSize="7" fill="#64748B" fontFamily="JetBrains Mono, monospace">Alimentation HT/BT</text>
      <line x1="30" y1="280" x2="50" y2="280" stroke="#475569" strokeWidth="1" strokeDasharray="4,2" />
      <text x="55" y="283" fontSize="7" fill="#64748B" fontFamily="JetBrains Mono, monospace">Distribution BT</text>
      <line x1="30" y1="293" x2="50" y2="293" stroke="#94A3B8" strokeWidth="1" />
      <text x="55" y="296" fontSize="7" fill="#64748B" fontFamily="JetBrains Mono, monospace">Terminaux</text>

      {/* Title block */}
      <rect x="280" y="248" width="180" height="50" rx="4" stroke="#E2E8F0" strokeWidth="1" fill="none" />
      <text x="370" y="263" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0369A1" fontFamily="JetBrains Mono, monospace">SCHÉMA DE PRINCIPE</text>
      <text x="370" y="275" textAnchor="middle" fontSize="7" fill="#334155" fontFamily="JetBrains Mono, monospace">Distribution Électrique BT</text>
      <text x="370" y="287" textAnchor="middle" fontSize="6" fill="#94A3B8" fontFamily="JetBrains Mono, monospace">Réf: BE-CFO-001 | Rév: A</text>
    </svg>
  );
}

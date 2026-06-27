"use client";

export default function SchemaCFA({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
        </pattern>
        <marker id="arrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#0EA5E9" />
        </marker>
      </defs>
      <rect width="480" height="300" fill="url(#grid2)" />

      {/* Baie réseau centrale */}
      <rect x="180" y="80" width="120" height="140" rx="4" stroke="#0EA5E9" strokeWidth="1.5" fill="none" />
      <text x="240" y="100" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0EA5E9" fontFamily="JetBrains Mono, monospace">BAIE RÉSEAU</text>
      {/* Equipment in rack */}
      {[
        { y: 108, label: "Routeur", color: "#0369A1" },
        { y: 122, label: "Switch 24P", color: "#0369A1" },
        { y: 136, label: "Switch 24P", color: "#0369A1" },
        { y: 150, label: "NVR 16ch", color: "#7C3AED" },
        { y: 164, label: "Centrale SSI", color: "#DC2626" },
        { y: 178, label: "Contrôle Accès", color: "#059669" },
        { y: 192, label: "Patch Panel", color: "#475569" },
      ].map((item, i) => (
        <g key={i}>
          <rect x="190" y={item.y} width="100" height="10" rx="1" stroke={item.color} strokeWidth="0.8" fill="none" />
          <text x="240" y={item.y + 7.5} textAnchor="middle" fontSize="6.5" fill={item.color} fontFamily="JetBrains Mono, monospace">{item.label}</text>
        </g>
      ))}

      {/* Left side — Informatique */}
      <rect x="20" y="40" width="100" height="30" rx="3" stroke="#0369A1" strokeWidth="1" fill="none" />
      <text x="70" y="53" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#0369A1" fontFamily="JetBrains Mono, monospace">PC / Bureautique</text>
      <text x="70" y="63" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">Cat6A – 1Gbps</text>

      <rect x="20" y="90" width="100" height="30" rx="3" stroke="#0369A1" strokeWidth="1" fill="none" />
      <text x="70" y="103" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#0369A1" fontFamily="JetBrains Mono, monospace">Wi-Fi AP</text>
      <text x="70" y="113" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">IEEE 802.11ax</text>

      <rect x="20" y="140" width="100" height="30" rx="3" stroke="#7C3AED" strokeWidth="1" fill="none" />
      <text x="70" y="153" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#7C3AED" fontFamily="JetBrains Mono, monospace">Caméras IP</text>
      <text x="70" y="163" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">PoE – 4K</text>

      <rect x="20" y="190" width="100" height="30" rx="3" stroke="#DC2626" strokeWidth="1" fill="none" />
      <text x="70" y="203" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#DC2626" fontFamily="JetBrains Mono, monospace">Détecteurs SSI</text>
      <text x="70" y="213" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">Boucle adressable</text>

      {/* Connection lines left */}
      <line x1="120" y1="55" x2="180" y2="130" stroke="#0369A1" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />
      <line x1="120" y1="105" x2="180" y2="140" stroke="#0369A1" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />
      <line x1="120" y1="155" x2="180" y2="160" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />
      <line x1="120" y1="205" x2="180" y2="172" stroke="#DC2626" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />

      {/* Right side */}
      <rect x="360" y="40" width="100" height="30" rx="3" stroke="#059669" strokeWidth="1" fill="none" />
      <text x="410" y="53" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#059669" fontFamily="JetBrains Mono, monospace">Badges RFID</text>
      <text x="410" y="63" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">Contrôle accès</text>

      <rect x="360" y="90" width="100" height="30" rx="3" stroke="#0369A1" strokeWidth="1" fill="none" />
      <text x="410" y="103" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#0369A1" fontFamily="JetBrains Mono, monospace">Interphonie IP</text>
      <text x="410" y="113" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">VoIP / SIP</text>

      <rect x="360" y="140" width="100" height="30" rx="3" stroke="#D97706" strokeWidth="1" fill="none" />
      <text x="410" y="153" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#D97706" fontFamily="JetBrains Mono, monospace">GTB</text>
      <text x="410" y="163" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">BACnet / MODBUS</text>

      <rect x="360" y="190" width="100" height="30" rx="3" stroke="#0EA5E9" strokeWidth="1" fill="none" />
      <text x="410" y="203" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#0EA5E9" fontFamily="JetBrains Mono, monospace">Fibre optique</text>
      <text x="410" y="213" textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="JetBrains Mono, monospace">SM/MM – 10Gbps</text>

      {/* Connection lines right */}
      <line x1="300" y1="128" x2="360" y2="55" stroke="#059669" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />
      <line x1="300" y1="138" x2="360" y2="105" stroke="#0369A1" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />
      <line x1="300" y1="165" x2="360" y2="155" stroke="#D97706" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />
      <line x1="300" y1="180" x2="360" y2="205" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#arrow2)" />

      {/* Title */}
      <rect x="130" y="248" width="220" height="36" rx="4" stroke="#E2E8F0" strokeWidth="1" fill="none" />
      <text x="240" y="264" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0EA5E9" fontFamily="JetBrains Mono, monospace">SCHÉMA CFA – COURANTS FAIBLES</text>
      <text x="240" y="276" textAnchor="middle" fontSize="6.5" fill="#94A3B8" fontFamily="JetBrains Mono, monospace">Réf: BE-CFA-001 | Rév: B</text>
    </svg>
  );
}

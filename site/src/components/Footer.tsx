import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

const links = [
  { href: "#accueil", label: "Accueil" },
  { href: "#apropos", label: "À propos" },
  { href: "#competences", label: "Compétences" },
  { href: "#services", label: "Services" },
  { href: "#realisations", label: "Réalisations" },
  { href: "#experience", label: "Expérience" },
  { href: "#contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-2)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <Image src="/logo.png" alt="BaldEngineer" width={150} height={42} className="mb-3 dark:brightness-0 dark:invert" unoptimized />
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Ingénierie électrique de haute et basse tension. Courants forts, courants faibles — Conception · Réalisation · Exécution.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>Navigation</p>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-2">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="text-sm transition-colors duration-200 cursor-pointer hover:underline" style={{ color: "var(--color-secondary)" }}>
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>Contact</p>
            <div className="space-y-2.5">
              {[
                { icon: Phone, text: "06.59.98.06.88", href: "tel:0659980688" },
                { icon: Mail, text: "thierno.balde@baldengineer.fr", href: "mailto:thierno.balde@baldengineer.fr" },
                { icon: MapPin, text: "27140 Gisors, France", href: null },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--color-cta)" }} />
                  {href ? (
                    <a href={href} className="text-xs hover:underline cursor-pointer" style={{ color: "var(--color-secondary)", fontFamily: "var(--font-jetbrains), monospace" }}>{text}</a>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--color-secondary)", fontFamily: "var(--font-jetbrains), monospace" }}>{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
          <p>© 2025 BaldEngineer – Thierno BALDE. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline cursor-pointer" style={{ color: "var(--color-muted)" }}>Mentions légales</a>
            <a href="#" className="hover:underline cursor-pointer" style={{ color: "var(--color-muted)" }}>Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

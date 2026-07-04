import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

const links = [
  { href: "#accueil",      label: "Accueil" },
  { href: "#apropos",      label: "À propos" },
  { href: "#competences",  label: "Compétences" },
  { href: "#services",     label: "Services" },
  { href: "#realisations", label: "Réalisations" },
  { href: "#experience",   label: "Expérience" },
  { href: "#contact",      label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "var(--color-deep)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <Image
              src="/logo.png"
              alt="BaldEngineer"
              width={140}
              height={83}
              className="mb-4"
              style={{ filter: "none" }}
              unoptimized
            />
            <p
              className="text-sm leading-relaxed max-w-[26ch]"
              style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}
            >
              Ingénierie électrique haute et basse tension.
              Courants forts, courants faibles —
              <span style={{ color: "var(--color-accent)", fontStyle: "italic", fontFamily: "var(--font-display)", fontSize: "1rem" }}>
                {" "}Conception · Réalisation · Exécution.
              </span>
            </p>
          </div>

          {/* Nav */}
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-5"
              style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
            >
              Navigation
            </p>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors duration-200 hover:text-[var(--color-accent-hi)]"
                  style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)" }}
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-5"
              style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
            >
              Contact
            </p>
            <div className="space-y-3">
              {[
                { icon: Phone, text: "06.59.98.06.88", href: "tel:0659980688" },
                { icon: Mail,  text: "thierno.balde@baldengineer.fr", href: "mailto:thierno.balde@baldengineer.fr" },
                { icon: MapPin,text: "27140 Gisors, France", href: null },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "var(--color-accent)" }}
                    strokeWidth={1.5}
                  />
                  {href ? (
                    <a
                      href={href}
                      className="text-xs transition-colors duration-200 hover:text-[var(--color-accent-hi)]"
                      style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                    >
                      {text}
                    </a>
                  ) : (
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                    >
                      {text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-3)", fontFamily: "var(--font-mono)" }}
        >
          <p>© {year} BaldEngineer – Thierno BALDE. Tous droits réservés.</p>
          <div className="flex gap-5">
            <a href="#" className="transition-colors duration-200 hover:text-[var(--color-text-2)]">
              Mentions légales
            </a>
            <a href="#" className="transition-colors duration-200 hover:text-[var(--color-text-2)]">
              Confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

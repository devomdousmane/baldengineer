import Image from "next/image";
import { FileText, Receipt, Calculator, ShieldCheck } from "lucide-react";
import { signInWithGoogle } from "@/lib/actions/auth";
import { GoogleSignInButton } from "@/components/forms/google-signin-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const highlights = [
  { icon: FileText,    label: "Devis & factures" },
  { icon: Receipt,     label: "Factur-X" },
  { icon: Calculator,  label: "Comptabilité" },
  { icon: ShieldCheck, label: "France & Guinée" },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baldengineer.fr";

const legalLinks = [
  { href: `${SITE_URL}/cgu`,            label: "CGU" },
  { href: `${SITE_URL}/confidentialite`, label: "Confidentialité" },
  { href: `${SITE_URL}/faq`,            label: "Cookies & FAQ" },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh flex flex-col">
      {/* ── Bandeau de marque horizontal ── */}
      <div
        className="relative flex items-center justify-between overflow-hidden px-4 sm:px-8 shrink-0"
        style={{ backgroundColor: "var(--color-primary)", height: "96px" }}
      >
        {/* Texture grille statique */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 90% 100% at 30% 50%, black 20%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 100% at 30% 50%, black 20%, transparent 90%)",
          }}
        />

        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="BaldEngineer"
            width={206}
            height={121}
            priority
            unoptimized
            className="w-auto h-7 sm:h-8 object-contain brightness-0 invert"
          />
        </div>

        <div className="relative z-10 hidden md:flex items-center gap-5">
          {highlights.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <span className="w-px h-4" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />}
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-accent-hi)" }} strokeWidth={1.75} />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ── Zone centrale ── */}
      <div className="relative flex-1 flex items-center justify-center bg-[var(--color-bg)] px-4 py-10 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-mesh" style={{ animation: "mesh-drift 18s ease-in-out infinite" }} />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          {/* Strip marché */}
          <div
            className="flex items-center justify-center gap-2 mb-5 animate-slide-up"
            style={{ animationDelay: "0ms" }}
          >
            <span
              className="px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-medium"
              style={{ backgroundColor: "var(--color-fr-dim)", color: "var(--color-fr)" }}
            >
              🇫🇷 France
            </span>
            <span
              className="px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-medium"
              style={{ backgroundColor: "var(--color-gn-dim)", color: "var(--color-gn)" }}
            >
              🇬🇳 Guinée
            </span>
          </div>

          {/* Card */}
          <div
            className="bg-[var(--color-card)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] p-6 sm:p-7 animate-slide-up"
            style={{ animationDelay: "60ms" }}
          >
            <h1 className="font-heading text-lg font-semibold text-[var(--color-text)] mb-1">
              Pilotez votre activité
            </h1>
            <p className="text-xs text-[var(--color-text-2)] mb-6 leading-relaxed">
              Connectez-vous avec votre compte Google pour accéder à vos devis, factures et comptabilité.
            </p>

            <form action={signInWithGoogle}>
              <GoogleSignInButton />
            </form>
          </div>

          {/* Mini-badges highlights (mobile + desktop) */}
          <div
            className="grid grid-cols-2 gap-2 mt-5 animate-slide-up"
            style={{ animationDelay: "120ms" }}
          >
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]"
                style={{ backgroundColor: "var(--color-accent-dim)" }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.75} />
                <span className="text-xs font-medium text-[var(--color-text-2)] truncate">{label}</span>
              </div>
            ))}
          </div>

          {/* Footer légal RGPD */}
          <div
            className="mt-7 flex flex-col items-center gap-2 animate-slide-up"
            style={{ animationDelay: "180ms" }}
          >
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-3)]">
              {legalLinks.map((l, i) => (
                <span key={l.href} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true">·</span>}
                  <a
                    href={l.href}
                    className="hover:text-[var(--color-text-2)] transition-colors duration-[var(--dur-fast)]"
                  >
                    {l.label}
                  </a>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-3)]">
              © {new Date().getFullYear()} BaldEngineer — Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

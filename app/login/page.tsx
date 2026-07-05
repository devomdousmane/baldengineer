import Image from "next/image";
import { FileText, Receipt, Calculator, ShieldCheck } from "lucide-react";
import { signInWithGoogle } from "@/lib/actions/auth";
import { GoogleSignInButton } from "@/components/forms/google-signin-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const highlights = [
  { icon: FileText,    label: "Devis & factures",  desc: "Créez et suivez vos documents commerciaux en quelques clics" },
  { icon: Receipt,     label: "Factur-X",          desc: "Facturation électronique conforme pour la France" },
  { icon: Calculator,  label: "Comptabilité",      desc: "Écritures et suivi de trésorerie centralisés" },
  { icon: ShieldCheck, label: "France & Guinée",   desc: "Numérotation et fiscalité adaptées à chaque marché" },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh grid grid-cols-1 lg:grid-cols-2">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ── Panneau gauche — identité de marque ── */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden px-12 py-12 xl:px-16"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {/* Texture de fond */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 50% at 20% 15%, color-mix(in srgb, var(--color-accent) 30%, transparent), transparent 60%),
                radial-gradient(ellipse 50% 45% at 90% 85%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 60%)
              `,
              animation: "mesh-drift 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 90%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 90%)",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="BaldEngineer"
            width={206}
            height={121}
            priority
            unoptimized
            className="w-auto h-9 object-contain brightness-0 invert"
          />
        </div>

        {/* Message + highlights */}
        <div className="relative z-10 max-w-md">
          <h1
            className="font-heading text-3xl xl:text-4xl font-semibold leading-tight mb-4"
            style={{ color: "var(--color-text-inv)" }}
          >
            Pilotez votre activité, où que vous soyez.
          </h1>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.65)" }}>
            BaldPro centralise devis, factures et comptabilité pour les professionnels
            opérant en France et en Guinée.
          </p>

          <div className="space-y-5">
            {highlights.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--color-accent-hi)" }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-inv)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer panneau gauche */}
        <p className="relative z-10 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} BaldEngineer — Tous droits réservés
        </p>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="relative flex items-center justify-center bg-[var(--color-bg)] px-4 py-10 sm:py-16">
        {/* Texture légère, visible dans les deux thèmes */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute inset-0 bg-mesh" style={{ animation: "mesh-drift 18s ease-in-out infinite" }} />
        </div>

        <div className="relative z-10 w-full max-w-sm animate-slide-up">
          {/* Logo mobile uniquement (le panneau gauche le montre déjà sur desktop) */}
          <div className="text-center mb-8 lg:hidden">
            <Image
              src="/logo.png"
              alt="BaldEngineer"
              width={206}
              height={121}
              priority
              unoptimized
              className="w-auto h-20 sm:h-24 object-contain mx-auto mb-4 drop-shadow-[0_8px_24px_rgb(45_138_62_/_0.25)]"
            />
            <p className="text-sm text-[var(--color-text-2)]">
              BaldPro — Devis · Factures · Comptabilité
            </p>
          </div>

          {/* Card */}
          <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] p-6 sm:p-7">
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-1">Connexion</h2>
            <p className="text-xs text-[var(--color-text-2)] mb-6">
              Connectez-vous avec votre compte Google pour accéder à votre espace.
            </p>

            <form action={signInWithGoogle}>
              <GoogleSignInButton />
            </form>
          </div>

          {/* Markets */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <span className="text-xs text-[var(--color-text-3)]">Disponible pour :</span>
            <span className="text-xs font-medium text-[var(--color-fr)]">🇫🇷 France</span>
            <span className="text-xs text-[var(--color-text-3)]">·</span>
            <span className="text-xs font-medium text-[var(--color-gn)]">🇬🇳 Guinée</span>
          </div>
        </div>
      </div>
    </div>
  );
}

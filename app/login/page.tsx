import Image from "next/image";
import { signInWithGoogle } from "@/lib/actions/auth";
import { GoogleSignInButton } from "@/components/forms/google-signin-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4 py-10 sm:py-16">
      {/* Texture de fond — glow + grille, cohérent avec le site vitrine */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-mesh"
          style={{ animation: "mesh-drift 18s ease-in-out infinite" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(color-mix(in srgb, var(--color-accent) 6%, transparent) 1px, transparent 1px),
              linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 6%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 85%)",
          }}
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
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
  );
}

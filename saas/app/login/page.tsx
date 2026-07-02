import { signInWithGoogle } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center text-white text-lg font-bold mx-auto mb-4 shadow-[var(--shadow-md)]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            BP
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">BaldPro</h1>
          <p className="text-sm text-[var(--color-text-2)] mt-1">
            Devis · Factures · Comptabilité
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] p-6">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-1">Connexion</h2>
          <p className="text-xs text-[var(--color-text-2)] mb-6">
            Connectez-vous avec votre compte Google pour accéder à votre espace.
          </p>

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] text-sm font-medium text-[var(--color-text)] flex items-center justify-center gap-3 hover:bg-[var(--color-bg-2)] transition-colors duration-[var(--dur-fast)] shadow-[var(--shadow-xs)] cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuer avec Google
            </button>
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

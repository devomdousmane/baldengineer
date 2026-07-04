import Link from "next/link";
import { FileX2, ArrowLeft } from "lucide-react";

export default function PrintNotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-bg-2)] flex items-center justify-center mx-auto mb-5">
          <FileX2 className="w-6 h-6 text-[var(--color-text-3)]" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--color-text)] mb-2">Document introuvable</h1>
        <p className="text-sm text-[var(--color-text-2)] mb-6 leading-relaxed">
          Ce devis ou cette facture n&apos;existe pas, a été supprimé, ou n&apos;est pas accessible depuis votre compte.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hi)] transition-colors duration-[var(--dur-fast)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}

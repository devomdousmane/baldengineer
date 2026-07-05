import { FileX2 } from "lucide-react";

export default function PublicViewNotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-bg-2)] flex items-center justify-center mx-auto mb-5">
          <FileX2 className="w-6 h-6 text-[var(--color-text-3)]" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--color-text)] mb-2">Document introuvable</h1>
        <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
          Ce lien n&apos;est plus valide ou le document a été supprimé. Contactez l&apos;expéditeur
          pour obtenir un nouveau lien.
        </p>
      </div>
    </div>
  );
}

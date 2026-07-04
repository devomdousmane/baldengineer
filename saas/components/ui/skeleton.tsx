interface SkeletonProps {
  className?: string;
}

/** Bloc shimmer générique — dimensionner via className (w-*, h-*). */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Carte KPI factice (dashboard, listes). */
export function SkeletonKpi() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-9 rounded-[var(--radius-md)]" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/** Rangées de table factices. */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="h-10 bg-[var(--table-header-bg)] border-b border-[var(--color-border)] flex items-center px-4">
        <Skeleton className="h-3 w-1/3" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 border-b border-[var(--color-border)] last:border-b-0"
          style={{ height: "var(--table-row-height)" }}
        >
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

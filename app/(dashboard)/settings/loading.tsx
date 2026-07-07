import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div
        className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-card)] px-5 flex items-center"
        style={{ height: "var(--header-height)" }}
      >
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2.5 w-40" />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-7">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-2)] w-fit">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-[var(--radius-sm)]" />
            ))}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

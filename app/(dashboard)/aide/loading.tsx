import { Skeleton } from "@/components/ui/skeleton";

export default function AideLoading() {
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div
        className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-card)] px-5 flex items-center"
        style={{ height: "var(--header-height)" }}
      >
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2.5 w-44" />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-7">
        <div className="max-w-[1200px] mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

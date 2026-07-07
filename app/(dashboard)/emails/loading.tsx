import { Skeleton, SkeletonKpi, SkeletonTable } from "@/components/ui/skeleton";

export default function EmailsLoading() {
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div
        className="sticky top-0 border-b border-[var(--color-border)] bg-[var(--color-card)] px-5 flex items-center"
        style={{ height: "var(--header-height)" }}
      >
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-7">
        <div className="max-w-[1200px] mx-auto space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SkeletonKpi />
            <SkeletonKpi />
            <SkeletonKpi />
            <SkeletonKpi />
          </div>
          <SkeletonTable rows={7} />
        </div>
      </div>
    </div>
  );
}

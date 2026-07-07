import { Search, type LucideIcon } from "lucide-react";

export function EmptyState({ message, icon: Icon = Search }: { message: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-4 py-12 text-center">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-bg-2)]">
        <Icon className="w-4 h-4 text-[var(--color-text-3)]" />
      </div>
      <p className="text-sm text-[var(--color-text-3)]">{message}</p>
    </div>
  );
}

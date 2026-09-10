import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Quick-action tile shown in a row on Home ("Smokes · 1,284 lineups") — the
 * replacement for a plain grid of identical cards. `dotClassName` colors the
 * small indicator dot per grenade/category so the row reads at a glance.
 */
export function StatPill({
  icon,
  label,
  count,
  href,
  dotClassName,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  href: string;
  dotClassName?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-[152px] shrink-0 flex-col gap-2 rounded-xl border border-border bg-background-card px-4 py-3.5 transition-colors hover:border-brand/40 hover:bg-background-surface-2 sm:min-w-[168px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-foreground-subtle transition-colors group-hover:text-brand">{icon}</span>
        {dotClassName && <span className={cn("h-2 w-2 rounded-full", dotClassName)} />}
      </div>
      <p className="font-display text-xl font-bold leading-none">{count.toLocaleString()}</p>
      <p className="text-xs text-foreground-muted">{label}</p>
    </Link>
  );
}

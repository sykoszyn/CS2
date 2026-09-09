import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent border border-accent/30",
        className,
      )}
      title="Verificado por el equipo de SmokeAR"
    >
      <BadgeCheck size={12} />
      VERIFIED
    </span>
  );
}

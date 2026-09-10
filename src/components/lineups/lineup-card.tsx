import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Lineup } from "@/types/content";
import type { GrenadeTypeEnum } from "@/types/database";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { DifficultyDots } from "@/components/ui/difficulty-dots";
import { cn } from "@/lib/utils/cn";

const GRENADE_SEED: Record<GrenadeTypeEnum, number> = { smoke: 0, decoy: 1, flash: 2, molotov: 3, he: 3 };

export function LineupCard({ lineup, index = 0 }: { lineup: Lineup; index?: number }) {
  const t = useTranslations("labels.grenadeType");
  const tCard = useTranslations("lineups.card");
  void index;

  return (
    <Link href={`/lineups/${lineup.slug}`} className="group block h-full w-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand/40 group-hover:shadow-lg group-hover:shadow-black/20">
        <div className="relative">
          <MediaPlaceholder seed={GRENADE_SEED[lineup.grenadeType]} className="h-32 w-full" />

          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold",
              lineup.side === "ct" ? "bg-ct/90 text-black" : lineup.side === "t" ? "bg-t/90 text-black" : "bg-black/60 text-white",
            )}
          >
            {lineup.side.toUpperCase()}
          </span>

          {lineup.verified && (
            <div className="absolute right-2 top-2">
              <VerifiedBadge />
            </div>
          )}

          <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {t(lineup.grenadeType)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <p className="text-eyebrow">{lineup.targetZone}</p>
          <p className="line-clamp-2 font-display text-sm font-semibold leading-snug group-hover:text-brand">
            {lineup.name}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-foreground-muted">
            <DifficultyDots value={lineup.difficulty} />
            <span className={cn("font-semibold", lineup.workedPercent >= 80 && "text-success")}>
              {tCard("workedPercent", { percent: lineup.workedPercent })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

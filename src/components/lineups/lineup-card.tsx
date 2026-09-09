import Link from "next/link";
import type { Lineup } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { DifficultyDots } from "@/components/ui/difficulty-dots";

const grenadeLabel: Record<Lineup["grenadeType"], string> = {
  smoke: "Smoke",
  flash: "Flash",
  molotov: "Molotov",
  he: "HE",
  decoy: "Decoy",
};

export function LineupCard({ lineup, index = 0 }: { lineup: Lineup; index?: number }) {
  return (
    <Link href={`/lineups/${lineup.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-brand/50">
        <MediaPlaceholder label={grenadeLabel[lineup.grenadeType]} seed={index} className="h-36 w-full" />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-sm font-semibold leading-snug group-hover:text-brand">
              {lineup.name}
            </p>
            {lineup.verified && <VerifiedBadge className="shrink-0" />}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={lineup.side === "ct" ? "ct" : lineup.side === "t" ? "t" : "default"}>
              {lineup.side.toUpperCase()}
            </Badge>
            <Badge variant="brand">{grenadeLabel[lineup.grenadeType]}</Badge>
            <Badge>{lineup.targetZone}</Badge>
          </div>
          <div className="mt-auto flex items-center justify-between pt-1 text-xs text-foreground-muted">
            <DifficultyDots value={lineup.difficulty} />
            <span>{lineup.workedPercent}% funciona</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

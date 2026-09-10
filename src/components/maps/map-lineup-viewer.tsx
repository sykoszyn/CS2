"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Plus, X } from "lucide-react";
import type { GameMap, Lineup } from "@/types/content";
import type { GrenadeTypeEnum, SideType } from "@/types/database";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Badge } from "@/components/ui/badge";
import { grenadeTypeValues } from "@/lib/labels/lineup-labels";
import { cn } from "@/lib/utils/cn";

const GRENADE_DOT: Record<GrenadeTypeEnum, string> = {
  smoke: "bg-slate-300 border-slate-400",
  flash: "bg-yellow-300 border-yellow-400",
  molotov: "bg-orange-500 border-orange-600",
  he: "bg-red-500 border-red-600",
  decoy: "bg-violet-400 border-violet-500",
};

export function MapLineupViewer({
  map,
  lineups,
  isAdmin,
}: {
  map: GameMap;
  lineups: Lineup[];
  isAdmin: boolean;
}) {
  const t = useTranslations("maps.lineupViewer");
  const tGrenade = useTranslations("labels.grenadeType");
  const tSide = useTranslations("labels.side");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [grenadeFilter, setGrenadeFilter] = useState<GrenadeTypeEnum | "all">("all");
  const [sideFilter, setSideFilter] = useState<SideType | "all">("all");
  const [floor, setFloor] = useState<"upper" | "lower">("upper");
  const [activeId, setActiveId] = useState<string | null>(null);

  const hasFloors = Boolean(map.radarUrlLower);
  const radarSrc = hasFloors && floor === "lower" ? map.radarUrlLower : map.radarUrl;

  const pinned = useMemo(() => lineups.filter((l) => l.pinX !== undefined && l.pinY !== undefined), [lineups]);

  const counts = useMemo(() => {
    const c: Record<GrenadeTypeEnum, number> = { smoke: 0, flash: 0, molotov: 0, he: 0, decoy: 0 };
    for (const l of pinned) c[l.grenadeType]++;
    return c;
  }, [pinned]);

  const visible = pinned.filter((l) => {
    if (grenadeFilter !== "all" && l.grenadeType !== grenadeFilter) return false;
    if (sideFilter !== "all" && l.side !== "both" && l.side !== sideFilter) return false;
    return true;
  });

  const active = visible.find((l) => l.id === activeId) ?? null;

  function handleBackgroundClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isAdmin || !containerRef.current) return;
    setActiveId(null);
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    router.push(`/lineups/new?map=${map.slug}&pinX=${x}&pinY=${y}`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
            {t("filterByGrenade")}
          </p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setGrenadeFilter("all")}
              className={cn(
                "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm",
                grenadeFilter === "all" ? "bg-brand-muted text-brand" : "text-foreground-muted hover:text-foreground",
              )}
            >
              {t("allGrenades")}
              <Badge>{pinned.length}</Badge>
            </button>
            {grenadeTypeValues.map((g) => (
              <button
                key={g}
                onClick={() => setGrenadeFilter(g)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm",
                  grenadeFilter === g ? "bg-brand-muted text-brand" : "text-foreground-muted hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full border", GRENADE_DOT[g])} />
                  {tGrenade(g)}
                </span>
                <Badge>{counts[g]}</Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
            {t("filterBySide")}
          </p>
          <div className="flex gap-1.5">
            {(["all", "ct", "t"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSideFilter(s)}
                className={cn(
                  "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium",
                  sideFilter === s
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {s === "all" ? t("anySide") : tSide(s)}
              </button>
            ))}
          </div>
        </div>

        {hasFloors && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
              {t("floor")}
            </p>
            <div className="flex gap-1.5">
              {(["upper", "lower"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFloor(f)}
                  className={cn(
                    "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium",
                    floor === f
                      ? "border-brand bg-brand-muted text-brand"
                      : "border-border text-foreground-muted hover:text-foreground",
                  )}
                >
                  {t(f === "upper" ? "floorUpper" : "floorLower")}
                </button>
              ))}
            </div>
          </div>
        )}

        {isAdmin && (
          <p className="rounded-md border border-brand/30 bg-brand-muted p-2.5 text-xs text-brand">
            <Plus size={12} className="mb-0.5 mr-1 inline" />
            {t("adminHint")}
          </p>
        )}
      </div>

      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-background-elevated",
          isAdmin && "cursor-crosshair",
        )}
      >
        {radarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- radar is a plain static asset, not optimizable content
          <img src={radarSrc} alt={map.name} className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />
        ) : (
          <MediaPlaceholder label={map.name} className="absolute inset-0 h-full w-full" />
        )}

        {visible.map((lineup) => (
          <button
            key={lineup.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveId(lineup.id === activeId ? null : lineup.id);
            }}
            style={{ left: `${lineup.pinX}%`, top: `${lineup.pinY}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md transition-transform hover:scale-125",
              "h-4 w-4",
              GRENADE_DOT[lineup.grenadeType],
              activeId === lineup.id && "ring-2 ring-brand ring-offset-1 ring-offset-background",
            )}
            aria-label={lineup.name}
          />
        ))}

        {active && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              left: `${Math.min(active.pinX ?? 0, 78)}%`,
              top: `${Math.min(active.pinY ?? 0, 78)}%`,
            }}
            className="absolute z-10 w-56 rounded-lg border border-border bg-background-card p-3 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-sm font-semibold leading-snug">{active.name}</p>
              <button onClick={() => setActiveId(null)} aria-label={t("closePopover")} className="shrink-0 text-foreground-subtle hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variant={active.side === "ct" ? "ct" : active.side === "t" ? "t" : "default"}>
                {active.side.toUpperCase()}
              </Badge>
              <Badge variant="brand">{tGrenade(active.grenadeType)}</Badge>
            </div>
            <Link href={`/lineups/${active.slug}`} className="mt-2 block text-sm font-medium text-brand hover:underline">
              {t("viewFull")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

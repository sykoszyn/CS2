"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import type { MapZone } from "@/types/content";
import { cn } from "@/lib/utils/cn";

export function MapZoneViewer({ zones }: { zones: MapZone[] }) {
  const [activeId, setActiveId] = useState<string | null>(zones[0]?.id ?? null);
  const active = zones.find((z) => z.id === activeId);
  const t = useTranslations("maps.zoneViewer");

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-background-elevated to-background">
        <div className="absolute inset-0 flex items-center justify-center text-xs text-foreground-subtle">
          {t("radarPending")}
        </div>
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveId(zone.id)}
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 transition-transform hover:scale-110",
              activeId === zone.id ? "bg-brand text-brand-foreground" : "bg-background-card text-foreground",
              "border border-border-strong",
            )}
            aria-label={zone.name}
          >
            <MapPin size={14} />
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background-card p-4">
        {active ? (
          <>
            <p className="font-display text-lg font-semibold">{active.name}</p>
            {active.aliases.length > 0 && (
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {t("alsoKnownAs")}{active.aliases.join(", ")}
              </p>
            )}
            <p className="mt-3 text-sm text-foreground-muted">{active.description}</p>
          </>
        ) : (
          <p className="text-sm text-foreground-muted">{t("tapHint")}</p>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
            {t("allCalls")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setActiveId(zone.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  activeId === zone.id
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { LineupCard } from "@/components/lineups/lineup-card";
import { LineupFilters } from "@/components/lineups/lineup-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getLineups } from "@/services/lineups.service";
import { getMaps } from "@/services/maps.service";
import type { GrenadeTypeEnum, SideType } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lineups de CS2",
  description:
    "Smokes, flashes, molotovs y HE grenades para todos los mapas competitivos de Counter-Strike 2, filtrados por mapa, lado y granada.",
};

export default async function LineupsPage({
  searchParams,
}: {
  searchParams: Promise<{ map?: string; side?: string; grenade?: string }>;
}) {
  const { map, side, grenade } = await searchParams;

  const [lineups, maps] = await Promise.all([
    getLineups({
      mapSlug: map,
      side: side as SideType | undefined,
      grenadeType: grenade as GrenadeTypeEnum | undefined,
    }),
    getMaps(),
  ]);

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Lineups</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Smokes, flashes, molotovs y HE grenades para cada mapa y situación.
          </p>
        </div>
        <Button href="/lineups/new" size="sm">
          Subir lineup
        </Button>
      </div>

      <div className="mt-4">
        <Suspense>
          <LineupFilters maps={maps} />
        </Suspense>
      </div>

      <div className="mt-6">
        {lineups.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lineups.map((lineup, i) => (
              <LineupCard key={lineup.id} lineup={lineup} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No encontramos lineups con esos filtros"
            description="Probá cambiar el mapa, el lado o el tipo de granada."
          />
        )}
      </div>
    </div>
  );
}

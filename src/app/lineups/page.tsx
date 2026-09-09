import type { Metadata } from "next";
import { Suspense } from "react";
import { LineupCard } from "@/components/lineups/lineup-card";
import { LineupFilters } from "@/components/lineups/lineup-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { lineups } from "@/lib/mock/lineups";

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

  const filtered = lineups.filter((l) => {
    if (map && l.mapSlug !== map) return false;
    if (side && l.side !== side) return false;
    if (grenade && l.grenadeType !== grenade) return false;
    return true;
  });

  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Lineups</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Smokes, flashes, molotovs y HE grenades para cada mapa y situación.
      </p>

      <div className="mt-4">
        <Suspense>
          <LineupFilters />
        </Suspense>
      </div>

      <div className="mt-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lineup, i) => (
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMapBySlug, getMapZones } from "@/services/maps.service";
import { getLineupsByMap } from "@/services/lineups.service";
import { getBoostsByMap } from "@/services/boosts.service";
import { getPlaysByMap } from "@/services/plays.service";
import { guides } from "@/lib/mock/guides";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { MapZoneViewer } from "@/components/maps/map-zone-viewer";
import { LineupCard } from "@/components/lineups/lineup-card";
import { BoostCard } from "@/components/boosts/boost-card";
import { PlayCard } from "@/components/plays/play-card";
import { GuideCard } from "@/components/guides/guide-card";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const map = await getMapBySlug(slug);
  if (!map) return {};

  return {
    title: `${map.name} — Calls, lineups y boosts`,
    description: map.description,
  };
}

export default async function MapDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const map = await getMapBySlug(slug);
  if (!map) notFound();

  const zones = await getMapZones(map);
  const mapLineups = await getLineupsByMap(slug);
  const mapBoosts = await getBoostsByMap(slug);
  const mapPlays = await getPlaysByMap(slug);
  const mapGuides = guides.filter((g) => g.mapSlug === slug);

  return (
    <div>
      <div className="relative border-b border-border">
        <MediaPlaceholder label={map.name} className="h-40 w-full lg:h-56" />
        <div className="px-4 py-4 lg:px-6">
          <h1 className="font-display text-2xl font-bold">{map.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground-muted">{map.description}</p>
          <div className="mt-2 flex gap-1.5">
            {map.bombsites.map((site) => (
              <Badge key={site} variant="brand">
                Site {site}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs
          defaultTab="calls"
          tabs={[
            {
              id: "calls",
              label: "Calls",
              content:
                zones.length > 0 ? (
                  <MapZoneViewer zones={zones} />
                ) : (
                  <EmptyState
                    title="Todavía no hay calls cargados para este mapa"
                    description="Este mapa está listo en la base de datos; los callouts se agregarán próximamente."
                  />
                ),
            },
            {
              id: "lineups",
              label: `Lineups (${mapLineups.length})`,
              content:
                mapLineups.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mapLineups.map((lineup, i) => (
                      <LineupCard key={lineup.id} lineup={lineup} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Todavía no hay lineups para este mapa" />
                ),
            },
            {
              id: "boosts",
              label: `Boosts (${mapBoosts.length})`,
              content:
                mapBoosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mapBoosts.map((boost, i) => (
                      <BoostCard key={boost.id} boost={boost} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Todavía no hay boosts para este mapa" />
                ),
            },
            {
              id: "plays",
              label: `Jugadas (${mapPlays.length})`,
              content:
                mapPlays.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mapPlays.map((play, i) => (
                      <PlayCard key={play.id} play={play} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Todavía no hay jugadas para este mapa" />
                ),
            },
            {
              id: "guides",
              label: `Guías (${mapGuides.length})`,
              content:
                mapGuides.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mapGuides.map((guide, i) => (
                      <GuideCard key={guide.id} guide={guide} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Todavía no hay guías para este mapa" />
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}

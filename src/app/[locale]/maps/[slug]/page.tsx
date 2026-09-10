import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getMapBySlug, getMapZones } from "@/services/maps.service";
import { getLineupsByMap } from "@/services/lineups.service";
import { getBoostsByMap } from "@/services/boosts.service";
import { getPlaysByMap } from "@/services/plays.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { guides } from "@/lib/mock/guides";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { MapZoneViewer } from "@/components/maps/map-zone-viewer";
import { MapLineupViewer } from "@/components/maps/map-lineup-viewer";
import { BoostCard } from "@/components/boosts/boost-card";
import { PlayCard } from "@/components/plays/play-card";
import { GuideCard } from "@/components/guides/guide-card";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const map = await getMapBySlug(slug);
  if (!map) return {};

  const t = await getTranslations({ locale, namespace: "maps.detail" });

  return {
    title: `${map.name} — ${t("metaTitleSuffix")}`,
    description: map.description,
  };
}

export default async function MapDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const map = await getMapBySlug(slug);
  if (!map) notFound();

  const [zones, mapLineups, mapBoosts, mapPlays, profile] = await Promise.all([
    getMapZones(map),
    getLineupsByMap(slug),
    getBoostsByMap(slug),
    getPlaysByMap(slug),
    getCurrentProfile(),
  ]);
  const mapGuides = guides.filter((g) => g.mapSlug === slug);
  const isAdmin = profile?.role === "admin" || profile?.role === "moderator";

  const t = await getTranslations("maps.detail");

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
                {t("site", { site })}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs
          defaultTab={["calls", "lineups", "boosts", "plays", "guides"].includes(tab ?? "") ? tab : "calls"}
          tabs={[
            {
              id: "calls",
              label: t("tabs.calls"),
              content:
                zones.length > 0 ? (
                  <MapZoneViewer zones={zones} />
                ) : (
                  <EmptyState
                    title={t("emptyCalls.title")}
                    description={t("emptyCalls.description")}
                  />
                ),
            },
            {
              id: "lineups",
              label: t("tabs.lineups", { count: mapLineups.length }),
              content:
                mapLineups.length > 0 ? (
                  <MapLineupViewer map={map} lineups={mapLineups} isAdmin={isAdmin} />
                ) : (
                  <EmptyState title={t("emptyLineups")} />
                ),
            },
            {
              id: "boosts",
              label: t("tabs.boosts", { count: mapBoosts.length }),
              content:
                mapBoosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mapBoosts.map((boost, i) => (
                      <BoostCard key={boost.id} boost={boost} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title={t("emptyBoosts")} />
                ),
            },
            {
              id: "plays",
              label: t("tabs.plays", { count: mapPlays.length }),
              content:
                mapPlays.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mapPlays.map((play, i) => (
                      <PlayCard key={play.id} play={play} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title={t("emptyPlays")} />
                ),
            },
            {
              id: "guides",
              label: t("tabs.guides", { count: mapGuides.length }),
              content:
                mapGuides.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mapGuides.map((guide, i) => (
                      <GuideCard key={guide.id} guide={guide} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title={t("emptyGuides")} />
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}

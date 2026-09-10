import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LineupCard } from "@/components/lineups/lineup-card";
import { LineupFilters } from "@/components/lineups/lineup-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getLineups } from "@/services/lineups.service";
import { getMaps } from "@/services/maps.service";
import type { GrenadeTypeEnum, SideType } from "@/types/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lineups.list" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

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

  const t = await getTranslations("lineups.list");

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>
        </div>
        <Button href="/lineups/new" size="sm">
          {t("upload")}
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
          <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
        )}
      </div>
    </div>
  );
}

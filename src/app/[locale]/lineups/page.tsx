import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { MapCard } from "@/components/maps/map-card";
import { Button } from "@/components/ui/button";
import { getMaps } from "@/services/maps.service";

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
  searchParams: Promise<{ map?: string }>;
}) {
  const { map } = await searchParams;
  if (map) {
    redirect({ href: `/maps/${map}?tab=lineups`, locale: await getLocale() });
    return null;
  }

  const maps = await getMaps();
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

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {maps.map((m, i) => (
          <MapCard key={m.id} map={m} index={i} href={`/maps/${m.slug}?tab=lineups`} />
        ))}
      </div>
    </div>
  );
}

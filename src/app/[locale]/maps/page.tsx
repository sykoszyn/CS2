import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getMaps } from "@/services/maps.service";
import { getLineups } from "@/services/lineups.service";
import { getBoosts } from "@/services/boosts.service";
import { guides } from "@/lib/mock/guides";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "maps.list" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function MapsPage() {
  const [maps, allLineups, allBoosts] = await Promise.all([getMaps(), getLineups(), getBoosts()]);
  const t = await getTranslations("maps.list");

  const lineupsByMap = new Map<string, number>();
  for (const l of allLineups) lineupsByMap.set(l.mapSlug, (lineupsByMap.get(l.mapSlug) ?? 0) + 1);
  const boostsByMap = new Map<string, number>();
  for (const b of allBoosts) boostsByMap.set(b.mapSlug, (boostsByMap.get(b.mapSlug) ?? 0) + 1);
  const guidesByMap = new Map<string, number>();
  for (const g of guides) if (g.mapSlug) guidesByMap.set(g.mapSlug, (guidesByMap.get(g.mapSlug) ?? 0) + 1);

  return (
    <div className="px-4 py-8 lg:px-6">
      <p className="text-eyebrow">{t("eyebrow")}</p>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {maps.map((map) => (
          <Link
            key={map.id}
            href={`/maps/${map.slug}`}
            className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl border border-border transition-all hover:border-brand/50 lg:h-80"
          >
            {map.radarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- static radar asset
              <img
                src={map.radarUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <MediaPlaceholder className="absolute inset-0 h-full w-full" />
            )}

            <div className="absolute right-3 top-3 flex gap-1">
              {map.bombsites.map((site) => (
                <Badge key={site} className="border-white/20 bg-black/40 text-white backdrop-blur-sm">
                  {site}
                </Badge>
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />

            <div className="relative z-10 p-4">
              <p className="font-display text-xl font-bold text-white drop-shadow-sm group-hover:text-brand sm:text-2xl">
                {map.name}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/75">
                <span>{t("lineups", { count: lineupsByMap.get(map.slug) ?? 0 })}</span>
                <span>{t("boosts", { count: boostsByMap.get(map.slug) ?? 0 })}</span>
                <span>{t("guides", { count: guidesByMap.get(map.slug) ?? 0 })}</span>
              </div>
              <span className="mt-2 hidden translate-y-1 text-sm font-semibold text-brand opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 sm:inline-block">
                {t("explore", { map: map.name })} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

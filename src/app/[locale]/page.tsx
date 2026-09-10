import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Cloud, Flame, Zap, Bomb, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentRail } from "@/components/layout/content-rail";
import { StatPill } from "@/components/layout/stat-pill";
import { QuickSearchTrigger } from "@/components/layout/quick-search";
import { Logo } from "@/components/layout/logo";
import { Link } from "@/i18n/navigation";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { DifficultyDots } from "@/components/ui/difficulty-dots";
import { LineupCard } from "@/components/lineups/lineup-card";
import { PlayCard } from "@/components/plays/play-card";
import { GuideCard } from "@/components/guides/guide-card";
import { guides } from "@/lib/mock/guides";
import { getMaps } from "@/services/maps.service";
import { getLineups } from "@/services/lineups.service";
import { getPlays } from "@/services/plays.service";
import type { GrenadeTypeEnum } from "@/types/database";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const GRENADE_ICON: Record<GrenadeTypeEnum, typeof Cloud> = {
  smoke: Cloud,
  flash: Zap,
  molotov: Flame,
  he: Bomb,
  decoy: Ghost,
};
const GRENADE_DOT: Record<GrenadeTypeEnum, string> = {
  smoke: "bg-slate-300",
  flash: "bg-yellow-300",
  molotov: "bg-orange-500",
  he: "bg-red-500",
  decoy: "bg-violet-400",
};
const GRENADE_ORDER: GrenadeTypeEnum[] = ["smoke", "flash", "molotov", "he", "decoy"];

const NEW_WITHIN_MS = 14 * 24 * 60 * 60 * 1000;

function isRecent(createdAt: string, withinMs: number): boolean {
  return Date.now() - new Date(createdAt).getTime() < withinMs;
}

function byNewest<T extends { createdAt: string }>(a: T, b: T): number {
  return b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0;
}

export default async function HomePage() {
  const [maps, allLineups, allPlays] = await Promise.all([getMaps(), getLineups(), getPlays()]);

  const t = await getTranslations("home");
  const tGrenade = await getTranslations("labels.grenadeType");

  const grenadeCounts = GRENADE_ORDER.map((g) => ({
    grenade: g,
    count: allLineups.filter((l) => l.grenadeType === g).length,
  }));

  const lineupCountByMap = new Map<string, number>();
  for (const l of allLineups) {
    lineupCountByMap.set(l.mapSlug, (lineupCountByMap.get(l.mapSlug) ?? 0) + 1);
  }

  const popularLineups = [...allLineups].sort((a, b) => b.usageCount - a.usageCount).slice(0, 4);
  const [featured, ...secondary] = popularLineups;

  const trending = [...allLineups].sort(byNewest).slice(0, 8);
  const featuredPlays = [...allPlays].sort(byNewest).slice(0, 8);

  return (
    <div className="space-y-10 pb-10 lg:space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-hero-mesh px-4 py-14 lg:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
            {t("heroPrefix")} <span className="text-brand">{t("heroHighlight")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-foreground-muted sm:text-lg">{t("heroSubtitle")}</p>

          <div className="mx-auto mt-7 max-w-md">
            <QuickSearchTrigger variant="hero" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button href="/lineups" size="lg">
              {t("exploreLineups")}
            </Button>
            <Button href="/maps" variant="secondary" size="lg">
              {t("exploreMaps")}
            </Button>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS — real counts per grenade type */}
      <section>
        <p className="text-eyebrow px-4 lg:px-6">{t("quickActions.eyebrow")}</p>
        <div className="scroll-rail mt-2 px-4 lg:px-6">
          {grenadeCounts.map(({ grenade, count }) => {
            const Icon = GRENADE_ICON[grenade];
            return (
              <StatPill
                key={grenade}
                href={`/lineups?grenade=${grenade}`}
                icon={<Icon size={20} />}
                label={tGrenade(grenade)}
                count={count}
                dotClassName={GRENADE_DOT[grenade]}
              />
            );
          })}
        </div>
      </section>

      {/* MAP DISCOVERY */}
      <ContentRail eyebrow={t("mapDiscovery.eyebrow")} title={t("mapDiscovery.title")} href="/maps" hrefLabel={t("popular.viewAll")}>
        {maps.map((map) => (
          <Link
            key={map.id}
            href={`/maps/${map.slug}`}
            className="group relative h-56 w-44 shrink-0 overflow-hidden rounded-xl border border-border transition-all hover:border-brand/50 sm:h-64 sm:w-52"
          >
            {map.radarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- static radar asset
              <img
                src={map.radarUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <MediaPlaceholder className="absolute inset-0 h-full w-full" />
            )}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent p-3">
              <p className="font-display text-lg font-bold text-white drop-shadow-sm">{map.name}</p>
              <p className="text-xs text-white/70">
                {t("mapDiscovery.lineupsCount", { count: lineupCountByMap.get(map.slug) ?? 0 })}
              </p>
              <span className="mt-2 hidden translate-y-1 text-xs font-semibold text-brand opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 sm:inline">
                {t("mapDiscovery.explore", { map: map.name })} →
              </span>
            </div>
          </Link>
        ))}
      </ContentRail>

      {/* POPULAR RIGHT NOW — 1 large + 3 small editorial layout */}
      {featured && (
        <section className="px-4 lg:px-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-eyebrow">{t("popular.eyebrow")}</p>
              <h2 className="font-display text-xl font-bold sm:text-2xl">{t("popular.title")}</h2>
            </div>
            <Link href="/lineups" className="text-sm font-medium text-foreground-muted hover:text-brand">
              {t("popular.viewAll")} →
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <Link
              href={`/lineups/${featured.slug}`}
              className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-xl border border-border-strong"
            >
              <MediaPlaceholder seed={0} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="relative z-10 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{tGrenade(featured.grenadeType)}</Badge>
                  <Badge variant={featured.side === "ct" ? "ct" : featured.side === "t" ? "t" : "default"}>
                    {featured.side.toUpperCase()}
                  </Badge>
                  {featured.verified && <VerifiedBadge />}
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-white group-hover:text-brand sm:text-3xl">
                  {featured.name}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-white/70">
                  <DifficultyDots value={featured.difficulty} />
                  <span className={cn(featured.workedPercent >= 80 && "text-success")}>{featured.workedPercent}% works</span>
                </div>
              </div>
            </Link>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {secondary.map((lineup, i) => (
                <div key={lineup.id} className="h-32 lg:h-auto">
                  <LineupCard lineup={lineup} index={i + 1} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRENDING — real "new" signal from createdAt */}
      {trending.length > 0 && (
        <ContentRail eyebrow={t("trending.eyebrow")} title={t("trending.title")} href="/lineups" hrefLabel={t("trending.viewAll")}>
          {trending.map((lineup) => {
            const isNewLineup = isRecent(lineup.createdAt, NEW_WITHIN_MS);
            return (
              <div key={lineup.id} className="relative h-56 w-48 shrink-0 sm:w-56">
                {isNewLineup && (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                    {t("trending.new")}
                  </span>
                )}
                <LineupCard lineup={lineup} />
              </div>
            );
          })}
        </ContentRail>
      )}

      {/* FEATURED PLAYS */}
      {featuredPlays.length > 0 && (
        <ContentRail eyebrow="Clip feed" title="Plays" href="/plays" hrefLabel={t("popular.viewAll")}>
          {featuredPlays.map((play, i) => (
            <div key={play.id} className="h-56 w-48 shrink-0 sm:w-56">
              <PlayCard play={play} index={i} />
            </div>
          ))}
        </ContentRail>
      )}

      {/* GUIDES */}
      {guides.length > 0 && (
        <ContentRail eyebrow={t("guides.eyebrow")} title={t("guides.title")} href="/guides" hrefLabel={t("guides.viewAll")}>
          {guides.map((guide, i) => (
            <div key={guide.id} className="h-56 w-48 shrink-0 sm:w-56">
              <GuideCard guide={guide} index={i} />
            </div>
          ))}
        </ContentRail>
      )}
    </div>
  );
}

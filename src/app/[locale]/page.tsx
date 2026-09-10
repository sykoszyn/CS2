import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { Logo } from "@/components/layout/logo";
import { MapCard } from "@/components/maps/map-card";
import { LineupCard } from "@/components/lineups/lineup-card";
import { PlayCard } from "@/components/plays/play-card";
import { GuideCard } from "@/components/guides/guide-card";
import { guides } from "@/lib/mock/guides";
import { getMaps } from "@/services/maps.service";
import { getLineups } from "@/services/lineups.service";
import { getPlays } from "@/services/plays.service";

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

export default async function HomePage() {
  const [maps, allLineups, allPlays] = await Promise.all([getMaps(), getLineups(), getPlays()]);
  const popularLineups = [...allLineups].sort((a, b) => b.usageCount - a.usageCount).slice(0, 6);
  const featuredPlays = [...allPlays]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const t = await getTranslations("home");

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border px-4 py-16 lg:px-6 lg:py-24">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 0%, var(--brand-muted), transparent), radial-gradient(50% 50% at 100% 10%, rgba(53,224,161,0.08), transparent)",
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            {t("heroPrefix")} <span className="text-brand">{t("heroHighlight")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground-muted sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/lineups" size="lg">
              {t("exploreLineups")}
            </Button>
            <Button href="/maps" variant="secondary" size="lg">
              {t("exploreMaps")}
            </Button>
            <Button href="/register" variant="ghost" size="lg">
              {t("createAccount")}
            </Button>
          </div>
        </div>
      </section>

      <Section title={t("sections.maps.title")} subtitle={t("sections.maps.subtitle")} href="/maps">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {maps.map((map, i) => (
            <MapCard key={map.id} map={map} index={i} />
          ))}
        </div>
      </Section>

      <Section
        title={t("sections.popularLineups.title")}
        subtitle={t("sections.popularLineups.subtitle")}
        href="/lineups"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularLineups.map((lineup, i) => (
            <LineupCard key={lineup.id} lineup={lineup} index={i} />
          ))}
        </div>
      </Section>

      <Section
        title={t("sections.featuredPlays.title")}
        subtitle={t("sections.featuredPlays.subtitle")}
        href="/plays"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPlays.map((play, i) => (
            <PlayCard key={play.id} play={play} index={i} />
          ))}
        </div>
      </Section>

      <Section title={t("sections.guides.title")} subtitle={t("sections.guides.subtitle")} href="/guides">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, i) => (
            <GuideCard key={guide.id} guide={guide} index={i} />
          ))}
        </div>
      </Section>
    </div>
  );
}

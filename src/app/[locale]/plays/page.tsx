import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PlayCard } from "@/components/plays/play-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getPlays } from "@/services/plays.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plays.list" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PlaysPage() {
  const plays = await getPlays();
  const t = await getTranslations("plays.list");

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>
        </div>
        <Button href="/plays/new" size="sm">
          {t("upload")}
        </Button>
      </div>
      <div className="mt-6">
        {plays.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plays.map((play, i) => (
              <PlayCard key={play.id} play={play} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("emptyTitle")} />
        )}
      </div>
    </div>
  );
}

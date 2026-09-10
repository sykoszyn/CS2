import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MapCard } from "@/components/maps/map-card";
import { getMaps } from "@/services/maps.service";

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
  const maps = await getMaps();
  const t = await getTranslations("maps.list");

  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {maps.map((map, i) => (
          <MapCard key={map.id} map={map} index={i} />
        ))}
      </div>
    </div>
  );
}

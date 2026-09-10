import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { GuideCard } from "@/components/guides/guide-card";
import { EmptyState } from "@/components/ui/empty-state";
import { guides } from "@/lib/mock/guides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides.list" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function GuidesPage() {
  const t = useTranslations("guides.list");

  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>
      <div className="mt-6">
        {guides.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, i) => (
              <GuideCard key={guide.id} guide={guide} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("emptyTitle")} />
        )}
      </div>
    </div>
  );
}

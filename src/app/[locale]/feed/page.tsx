import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FeedItemCard } from "@/components/feed/feed-item";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeedItems } from "@/services/feed.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feed" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function FeedPage() {
  const [items, profile] = await Promise.all([getFeedItems(), getCurrentProfile()]);
  const t = await getTranslations("feed");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>

      <div className="mt-6 space-y-3">
        {items.length > 0 ? (
          items.map((item) => <FeedItemCard key={item.id} item={item} isLoggedIn={Boolean(profile)} />)
        ) : (
          <EmptyState title={t("emptyTitle")} />
        )}
      </div>
    </div>
  );
}

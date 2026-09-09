import type { Metadata } from "next";
import { FeedItemCard } from "@/components/feed/feed-item";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeedItems } from "@/services/feed.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feed de la comunidad",
  description: "Últimos lineups, jugadas, guías y boosts publicados por la comunidad de SmokeAR.",
};

export default async function FeedPage() {
  const [items, profile] = await Promise.all([getFeedItems(), getCurrentProfile()]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Feed</h1>
      <p className="mt-1 text-sm text-foreground-muted">Lo último que subió la comunidad.</p>

      <div className="mt-6 space-y-3">
        {items.length > 0 ? (
          items.map((item) => <FeedItemCard key={item.id} item={item} isLoggedIn={Boolean(profile)} />)
        ) : (
          <EmptyState title="Todavía no hay actividad en el feed" />
        )}
      </div>
    </div>
  );
}

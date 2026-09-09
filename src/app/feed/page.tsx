import type { Metadata } from "next";
import { FeedItemCard } from "@/components/feed/feed-item";
import { EmptyState } from "@/components/ui/empty-state";
import { feedItems } from "@/lib/mock/feed";

export const metadata: Metadata = {
  title: "Feed de la comunidad",
  description: "Últimos lineups, jugadas, guías y boosts publicados por la comunidad de CS2 Academy.",
};

export default function FeedPage() {
  const sorted = [...feedItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Feed</h1>
      <p className="mt-1 text-sm text-foreground-muted">Lo último que subió la comunidad.</p>

      <div className="mt-6 space-y-3">
        {sorted.length > 0 ? (
          sorted.map((item) => <FeedItemCard key={item.id} item={item} />)
        ) : (
          <EmptyState title="Todavía no hay actividad en el feed" />
        )}
      </div>
    </div>
  );
}

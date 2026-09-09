import Link from "next/link";
import { MessageCircle, Share2 } from "lucide-react";
import type { FeedItem } from "@/types/content";
import type { ContentTypeEnum } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/ui/like-button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { formatRelativeDate } from "@/lib/utils/format";

const typeToPath: Record<FeedItem["type"], string> = {
  lineup: "/lineups",
  play: "/plays",
  guide: "/guides",
  boost: "/boosts",
};

const typeLabel: Record<FeedItem["type"], string> = {
  lineup: "Lineup",
  play: "Jugada",
  guide: "Guía",
  boost: "Boost",
};

export function FeedItemCard({ item, isLoggedIn }: { item: FeedItem; isLoggedIn: boolean }) {
  const href = `${typeToPath[item.type]}/${item.targetSlug}`;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-background-elevated" />
        <div className="flex-1">
          <p className="text-sm">
            <Link href={`/profile/${item.username}`} className="font-semibold hover:text-brand">
              {item.username}
            </Link>{" "}
            <span className="text-foreground-muted">{item.title}</span>
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge>{typeLabel[item.type]}</Badge>
            <span className="text-xs text-foreground-subtle">{formatRelativeDate(item.createdAt)}</span>
          </div>
          <Link href={href} className="mt-2 block text-sm font-medium text-brand hover:underline">
            Ver contenido →
          </Link>
          <div className="mt-3 flex items-center gap-2">
            {item.contentId ? (
              <>
                <LikeButton
                  contentType={item.type as ContentTypeEnum}
                  contentId={item.contentId}
                  isLoggedIn={isLoggedIn}
                  initialLiked={item.likedByMe ?? false}
                  initialCount={item.likeCount ?? 0}
                  size="sm"
                />
                <FavoriteButton
                  contentType={item.type as ContentTypeEnum}
                  contentId={item.contentId}
                  isLoggedIn={isLoggedIn}
                  initialFavorited={item.favoritedByMe ?? false}
                  size="sm"
                />
              </>
            ) : null}
            <Link
              href={href}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground-muted hover:text-foreground"
            >
              <MessageCircle size={12} /> Comentar
            </Link>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground-muted hover:text-foreground"
              aria-label="Compartir"
            >
              <Share2 size={12} /> Compartir
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

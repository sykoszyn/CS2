import Link from "next/link";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import type { FeedItem } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function FeedItemCard({ item }: { item: FeedItem }) {
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
          <Link
            href={`${typeToPath[item.type]}/${item.targetSlug}`}
            className="mt-2 block text-sm font-medium text-brand hover:underline"
          >
            Ver contenido →
          </Link>
          <div className="mt-3 flex items-center gap-4 text-foreground-muted">
            <button className="flex items-center gap-1 text-xs hover:text-brand" aria-label="Me gusta">
              <Heart size={14} /> Like
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-brand" aria-label="Comentar">
              <MessageCircle size={14} /> Comentar
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-brand" aria-label="Guardar">
              <Bookmark size={14} /> Guardar
            </button>
            <button className="flex items-center gap-1 text-xs hover:text-brand" aria-label="Compartir">
              <Share2 size={14} /> Compartir
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

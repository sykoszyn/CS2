import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Heart, MessageCircle, Play as PlayIcon } from "lucide-react";
import type { Play } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export function PlayCard({ play, index = 0 }: { play: Play; index?: number }) {
  const t = useTranslations("labels.playCategory");

  return (
    <Link href={`/plays/${play.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-brand/50">
        <div className="relative">
          <MediaPlaceholder label={play.title} seed={index} className="h-40 w-full" />
          <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/70">
            <PlayIcon size={14} className="fill-foreground text-foreground" />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <Badge variant="brand" className="w-fit">{t(play.category)}</Badge>
          <p className="font-display text-sm font-semibold leading-snug group-hover:text-brand">
            {play.title}
          </p>
          <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <Heart size={12} /> {play.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} /> {play.commentCount}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

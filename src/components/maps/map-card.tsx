import { Link } from "@/i18n/navigation";
import type { GameMap } from "@/types/content";
import { Card } from "@/components/ui/card";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export function MapCard({ map, index = 0 }: { map: GameMap; index?: number }) {
  return (
    <Link href={`/maps/${map.slug}`} className="group block">
      <Card className="overflow-hidden transition-colors group-hover:border-brand/50">
        <MediaPlaceholder label={map.name} seed={index} className="h-32 w-full" />
        <div className="p-3">
          <p className="font-display text-sm font-semibold group-hover:text-brand">{map.name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted">{map.description}</p>
        </div>
      </Card>
    </Link>
  );
}

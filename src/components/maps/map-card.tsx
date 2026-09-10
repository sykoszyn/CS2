import { Link } from "@/i18n/navigation";
import type { GameMap } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export function MapCard({
  map,
  index = 0,
  href,
}: {
  map: GameMap;
  index?: number;
  /** Override the default `/maps/[slug]` destination — e.g. deep-linking straight into a tab. */
  href?: string;
}) {
  return (
    <Link href={href ?? `/maps/${map.slug}`} className="group block h-full">
      <Card className="relative flex h-48 flex-col justify-end overflow-hidden transition-colors group-hover:border-brand/50 sm:h-56">
        <div className="absolute inset-0 bg-background-elevated">
          {map.radarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- static radar asset, no next/image optimization needed
            <img
              src={map.radarUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
          ) : (
            <MediaPlaceholder seed={index} className="h-full w-full" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <div className="absolute right-2.5 top-2.5 flex gap-1">
          {map.bombsites.map((site) => (
            <Badge key={site} className="border-white/20 bg-black/40 text-white backdrop-blur-sm">
              {site}
            </Badge>
          ))}
        </div>

        <div className="relative z-10 p-3">
          <p className="font-display text-base font-bold text-white drop-shadow-sm group-hover:text-brand sm:text-lg">
            {map.name}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-white/75">{map.description}</p>
        </div>
      </Card>
    </Link>
  );
}

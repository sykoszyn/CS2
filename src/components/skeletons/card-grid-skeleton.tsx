import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

/** Loading placeholder for card-grid list pages (maps, lineups, boosts, plays, guides, feed). */
export function CardGridSkeleton({
  count = 6,
  gridClassName = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
  mediaClassName = "h-36 w-full",
}: {
  count?: number;
  gridClassName?: string;
  mediaClassName?: string;
}) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className={cn("rounded-none", mediaClassName)} />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}

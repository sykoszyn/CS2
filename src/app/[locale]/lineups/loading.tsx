import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="mt-6">
        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}

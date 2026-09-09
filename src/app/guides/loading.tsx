import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8 lg:px-6">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6">
        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8 lg:px-6">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6">
        <CardGridSkeleton
          count={8}
          gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          mediaClassName="h-32 w-full"
        />
      </div>
    </div>
  );
}

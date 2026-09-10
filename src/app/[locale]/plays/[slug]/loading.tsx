import { DetailSkeleton } from "@/components/skeletons/detail-skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8 lg:px-6">
      <DetailSkeleton />
    </div>
  );
}

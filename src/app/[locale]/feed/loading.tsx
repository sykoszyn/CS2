import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <Skeleton className="h-7 w-24" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-background-card p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="mt-3 h-40 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}


import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  type?: "card" | "list" | "dashboard" | "table";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = "card", count = 3, className }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <div className="space-y-4 p-6 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-4 p-3 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-3">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );

  const skeletonComponents = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    dashboard: renderDashboardSkeleton,
    table: renderTableSkeleton,
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {type === "dashboard" ? (
        skeletonComponents[type]()
      ) : (
        Array.from({ length: count }).map((_, i) => (
          <div key={i} className="mb-4 last:mb-0">
            {skeletonComponents[type]()}
          </div>
        ))
      )}
    </div>
  );
}

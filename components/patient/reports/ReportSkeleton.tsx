function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-lg ${className}`} />;
}

export function ReportCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md space-y-sm">
      <Shimmer className="h-36 w-full rounded-xl" />
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-3 w-1/2" />
      <div className="flex gap-xs pt-xs">
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function ReportsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GallerySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-md p-md">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <Shimmer className={`h-12 ${i % 2 === 0 ? "w-1/2" : "w-2/3"} rounded-2xl`} />
        </div>
      ))}
    </div>
  );
}

export function UploadSkeleton() {
  return (
    <div className="space-y-md">
      <Shimmer className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
        {[1, 2, 3, 4].map((i) => (
          <Shimmer key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ReportDetailsSkeleton() {
  return (
    <div className="space-y-lg">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg space-y-sm">
        <Shimmer className="h-6 w-2/3" />
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-4 w-1/2" />
      </div>
      <GallerySkeleton />
    </div>
  );
}

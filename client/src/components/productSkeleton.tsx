export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-app-border overflow-hidden p-3.5 space-y-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-zinc-200/80 rounded-xl w-full" />

      {/* Badges / Rating Skeleton */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-3.5 bg-zinc-200 rounded w-16" />
        <div className="h-3.5 bg-zinc-200 rounded w-8" />
      </div>

      {/* Title Skeleton */}
      <div className="space-y-1.5">
        <div className="h-4 bg-zinc-200 rounded w-5/6" />
        <div className="h-4 bg-zinc-200 rounded w-2/3" />
      </div>

      {/* Price and Button Skeleton */}
      <div className="pt-2 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-5 bg-zinc-200 rounded w-14" />
          <div className="h-3 bg-zinc-200 rounded w-8" />
        </div>
        <div className="size-8.5 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

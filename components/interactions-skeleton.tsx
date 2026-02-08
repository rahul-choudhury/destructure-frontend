export function InteractionsSkeleton() {
  return (
    <div className="mt-12 border-t border-foreground-10 pt-8">
      <p className="mb-4 text-sm text-foreground-50">
        Made it this far? Drop a reaction or leave a comment below.
      </p>

      {/* Reactions Skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-8 w-14 animate-pulse rounded-full border border-foreground-10 bg-foreground-10/30"
          />
        ))}
      </div>

      {/* Comments Section Skeleton */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>

        {/* Comments List Skeleton */}
        <div className="mt-6 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-foreground-10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-foreground-10" />
                  <div className="h-3 w-full rounded bg-foreground-10" />
                  <div className="h-3 w-2/3 rounded bg-foreground-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen pb-16 animate-pulse">
      {/* ── Hero header skeleton ── */}
      <div className="relative overflow-hidden border-b border-border/60 bg-linear-to-b from-muted/40 to-transparent">
        {/* Dot-grid (static, no skeleton needed) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            {/* Left */}
            <div className="space-y-4">
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
              {/* Title */}
              <Skeleton className="h-12 w-72 md:w-96 rounded-xl" />
              {/* Description */}
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            {/* CTA button */}
            <Skeleton className="h-11 w-36 rounded-full shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Featured post skeleton */}
        <div className="space-y-3">
          {/* "✦ Featured" label row */}
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="h-3 w-16 rounded-full" />
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="relative w-full min-h-[400px] md:min-h-[480px] rounded-3xl overflow-hidden">
            <Skeleton className="absolute inset-0 rounded-3xl" />
            {/* Simulated overlay content */}
            <div className="absolute bottom-8 left-8 space-y-3">
              <Skeleton className="h-4 w-24 rounded-full bg-white/20" />
              <Skeleton className="h-9 w-80 rounded-lg bg-white/20" />
              <Skeleton className="h-4 w-56 rounded-lg bg-white/20" />
            </div>
          </div>
        </div>

        {/* Filters skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-sm rounded-full" />
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>

        {/* Main grid + sidebar */}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          {/* Posts grid */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Categories card */}
            <div className="rounded-2xl border border-border/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-3.5 w-20 rounded-full" />
              </div>
              <div className="p-2 space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton
                        className="h-3 rounded-full"
                        style={{ width: `${60 + i * 12}px` }}
                      />
                    </div>
                    <Skeleton className="h-5 w-7 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags card */}
            <div className="rounded-2xl border border-border/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-3.5 w-24 rounded-full" />
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-7 rounded-full"
                    style={{ width: `${50 + (i % 4) * 14}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Blog card skeleton ─────────────────────────────────────────────────────

function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
      {/* Cover image */}
      <Skeleton className="aspect-video w-full" />

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Category badge */}
        <Skeleton className="h-5 w-20 rounded-full" />
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </div>
        {/* Excerpt */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-5/6 rounded" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mt-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-20 rounded" />
              <Skeleton className="h-2 w-14 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-6 rounded" />
            <Skeleton className="h-3 w-6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex animate-pulse items-start gap-4 rounded-2xl border border-stone-200 bg-surface p-5 dark:border-stone-800">
      <div className="h-12 w-12 shrink-0 rounded-full bg-stone-200 dark:bg-stone-800" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-1/3 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-1/2 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-1/4 rounded bg-stone-200 dark:bg-stone-800" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div className="animate-pulse space-y-2">
          <div className="h-9 w-48 rounded bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-64 rounded bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
      </div>
      <div className="space-y-3" aria-hidden="true">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <span className="sr-only" role="status">
        Loading contacts…
      </span>
    </main>
  );
}

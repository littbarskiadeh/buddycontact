export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />

      <div className="mb-6 flex animate-pulse items-start gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full bg-stone-200 dark:bg-stone-800" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-7 w-48 rounded bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-40 rounded bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-56 rounded bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>

      <div className="mb-8 h-32 animate-pulse rounded-2xl border border-stone-200 bg-surface dark:border-stone-800" />
      <div className="h-24 animate-pulse rounded-2xl border border-stone-200 bg-surface dark:border-stone-800" />

      <span className="sr-only" role="status">
        Loading contact…
      </span>
    </main>
  );
}

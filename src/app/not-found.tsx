import Link from "next/link";
import { UserRoundX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        <UserRoundX className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-foreground">
        This contact isn&apos;t here
      </h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        It may have been deleted, or the link is out of date.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950"
      >
        Back to contacts
      </Link>
    </main>
  );
}

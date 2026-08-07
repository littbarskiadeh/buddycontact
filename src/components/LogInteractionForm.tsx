"use client";

import { useId, useState, useTransition } from "react";
import { logInteraction } from "@/app/actions";

export function LogInteractionForm({ contactId }: { contactId: string }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const noteId = useId();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await logInteraction(contactId, note || undefined);
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setNote("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
      <div>
        <label
          htmlFor={noteId}
          className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          What did you talk about? (optional)
        </label>
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Caught up about their new job…"
          className="w-full rounded-xl border border-stone-300 bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-700"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-stone-950"
      >
        {isPending ? "Logging…" : "Log Contact"}
      </button>
    </form>
  );
}

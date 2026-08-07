"use client";

import { useId, useState, useTransition } from "react";
import { Mic, Square } from "lucide-react";
import { logInteraction } from "@/app/actions";
import { CHANNEL_LABELS, INTERACTION_CHANNELS } from "@/lib/channels";
import type { InteractionChannel } from "@/lib/channels";
import { useSpeechDictation } from "@/lib/useSpeechDictation";

export function LogInteractionForm({ contactId }: { contactId: string }) {
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState<InteractionChannel | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const noteId = useId();
  const channelId = useId();

  const dictation = useSpeechDictation((transcript) => {
    setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await logInteraction(
        contactId,
        note || undefined,
        channel || undefined,
      );
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setNote("");
      setChannel("");
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
          htmlFor={channelId}
          className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          How did you connect? (optional)
        </label>
        <select
          id={channelId}
          value={channel}
          onChange={(e) =>
            setChannel(e.target.value as InteractionChannel | "")
          }
          className="w-full rounded-xl border border-stone-300 bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-700"
        >
          <option value="">Not specified</option>
          {INTERACTION_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor={noteId}
            className="text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            What did you talk about? (optional)
          </label>
          {dictation.isSupported && (
            <button
              type="button"
              onClick={dictation.toggle}
              aria-pressed={dictation.isListening}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                dictation.isListening
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              {dictation.isListening ? (
                <>
                  <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                  Dictate
                </>
              )}
            </button>
          )}
        </div>
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

"use client";

import { useId, useState, useTransition } from "react";
import { Mic, SendHorizontal, Square } from "lucide-react";
import { logInteraction } from "@/app/actions";
import { CHANNEL_ICONS } from "@/components/channelIcons";
import { CHANNEL_LABELS, INTERACTION_CHANNELS } from "@/lib/channels";
import type { InteractionChannel } from "@/lib/channels";
import { useSpeechDictation } from "@/lib/useSpeechDictation";

type LogInteractionFormProps = {
  contactId: string;
  /** Called after a successful log, in addition to the built-in field reset. */
  onLogged?: () => void;
  /** Renders a Cancel button that calls this instead of submitting. */
  onCancel?: () => void;
  submitLabel?: string;
  autoFocus?: boolean;
};

export function LogInteractionForm({
  contactId,
  onLogged,
  onCancel,
  submitLabel = "Log Contact",
  autoFocus = false,
}: LogInteractionFormProps) {
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState<InteractionChannel | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const noteId = useId();

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
      onLogged?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <div
        role="group"
        aria-label="How did you connect?"
        className="flex flex-wrap gap-1.5"
      >
        {INTERACTION_CHANNELS.map((c) => {
          const Icon = CHANNEL_ICONS[c];
          const selected = channel === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={selected}
              onClick={() => setChannel(selected ? "" : c)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                selected
                  ? "bg-teal-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
              }`}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
              {CHANNEL_LABELS[c]}
            </button>
          );
        })}
      </div>

      <label htmlFor={noteId} className="sr-only">
        What did you talk about? (optional)
      </label>
      <div className="shadow-elevated focus-within:shadow-elevated-lg flex items-end gap-1.5 rounded-2xl bg-surface p-2 transition-shadow focus-within:ring-2 focus-within:ring-teal-500">
        {dictation.isSupported && (
          <button
            type="button"
            onClick={dictation.toggle}
            aria-pressed={dictation.isListening}
            aria-label={dictation.isListening ? "Stop dictation" : "Dictate"}
            title={dictation.isListening ? "Stop dictation" : "Dictate"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 ${
              dictation.isListening
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            {dictation.isListening ? (
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Mic className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
        <textarea
          id={noteId}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={1}
          autoFocus={autoFocus}
          placeholder="Caught up about their new job…"
          className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-base text-foreground placeholder:text-stone-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-label={submitLabel}
          title={submitLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition-all hover:bg-teal-700 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-stone-950"
        >
          <SendHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded text-sm text-stone-500 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-stone-400"
        >
          Cancel
        </button>
      )}
    </form>
  );
}

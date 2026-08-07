"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Mic, Square, Zap } from "lucide-react";
import { logInteraction } from "@/app/actions";
import { CHANNEL_LABELS, INTERACTION_CHANNELS } from "@/lib/channels";
import type { InteractionChannel } from "@/lib/channels";
import { useSpeechDictation } from "@/lib/useSpeechDictation";
import type { Contact } from "@/types";

type QuickLogButtonProps = {
  contacts: Pick<Contact, "id" | "name" | "company">[];
};

export function QuickLogButton({ contacts }: QuickLogButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-stone-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-950"
      >
        <Zap className="h-4 w-4" aria-hidden="true" />
        Quick Log
      </button>
      {isOpen && (
        <QuickLogModal contacts={contacts} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

function QuickLogModal({
  contacts,
  onClose,
}: {
  contacts: Pick<Contact, "id" | "name" | "company">[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState<InteractionChannel | "">("");
  const [justLogged, setJustLogged] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const noteId = useId();
  const channelId = useId();

  const dictation = useSpeechDictation((transcript) => {
    setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const matches =
    query.trim().length === 0
      ? []
      : contacts
          .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6);

  function reset() {
    setSelected(null);
    setQuery("");
    setNote("");
    setChannel("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    startTransition(async () => {
      await logInteraction(
        selected.id,
        note || undefined,
        channel || undefined,
      );
      setJustLogged(selected.name);
      reset();
      setTimeout(() => setJustLogged(null), 2500);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quick log a contact"
        className="animate-fade-in-up w-full max-w-md rounded-2xl border border-stone-200 bg-surface p-5 shadow-lg dark:border-stone-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Quick Log
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded text-sm text-stone-500 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-stone-400"
          >
            Close
          </button>
        </div>

        {justLogged && (
          <p
            role="status"
            aria-live="polite"
            className="mb-3 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
          >
            Logged contact with {justLogged}.
          </p>
        )}

        {!selected ? (
          <div>
            <label htmlFor="quick-log-search" className="sr-only">
              Search contacts
            </label>
            <input
              id="quick-log-search"
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a name…"
              className="w-full rounded-xl border border-stone-300 bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-700"
            />
            {matches.length > 0 && (
              <ul className="mt-2 space-y-1">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelected({ id: c.id, name: c.name })}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:hover:bg-stone-800"
                    >
                      <span className="font-medium text-foreground">
                        {c.name}
                      </span>
                      {c.company && (
                        <span className="text-stone-500 dark:text-stone-400">
                          {" "}
                          · {c.company}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {query.trim().length > 0 && matches.length === 0 && (
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                No matching contacts.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Logging contact with{" "}
              <span className="font-semibold text-foreground">
                {selected.name}
              </span>
              .{" "}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-orange-700 hover:underline dark:text-orange-400"
              >
                Change
              </button>
            </p>

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
                        <Square
                          className="h-3 w-3 fill-current"
                          aria-hidden="true"
                        />
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
        )}
      </div>
    </div>
  );
}

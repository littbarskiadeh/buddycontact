"use client";

import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import { LogInteractionForm } from "@/components/LogInteractionForm";
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
        className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-stone-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-950"
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
  const [justLogged, setJustLogged] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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
        className="animate-fade-in-up w-full max-w-md rounded-3xl border border-stone-200 bg-surface p-5 shadow-lg dark:border-stone-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Quick Log
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded text-sm text-stone-500 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-stone-400"
          >
            Close
          </button>
        </div>

        {justLogged && (
          <p
            role="status"
            aria-live="polite"
            className="mb-3 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
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
              className="w-full rounded-xl border border-stone-300 bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-stone-700"
            />
            {matches.length > 0 && (
              <ul className="mt-2 space-y-1">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelected({ id: c.id, name: c.name })}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-stone-800"
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
          <div className="space-y-3">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Logging contact with{" "}
              <span className="font-semibold text-foreground">
                {selected.name}
              </span>
              .{" "}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-teal-700 hover:underline dark:text-teal-400"
              >
                Change
              </button>
            </p>
            <LogInteractionForm
              contactId={selected.id}
              autoFocus
              onLogged={() => {
                setJustLogged(selected.name);
                setSelected(null);
                setQuery("");
                setTimeout(() => setJustLogged(null), 2500);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

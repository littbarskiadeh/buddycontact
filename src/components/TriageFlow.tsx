"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, PartyPopper } from "lucide-react";
import { snoozeContact } from "@/app/actions";
import { FollowUpBadge, FOLLOWUP_STYLES } from "@/components/FollowUpBadge";
import { LogInteractionForm } from "@/components/LogInteractionForm";
import { SnoozeSelect } from "@/components/SnoozeSelect";
import { formatRelativeTime, type FollowUpStatus } from "@/lib/followup";

export type TriageContact = {
  id: string;
  name: string;
  company: string | null;
  lastContactedAt: string | null;
  cadenceDays: number | null;
  status: FollowUpStatus;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TriageFlow({ contacts }: { contacts: TriageContact[] }) {
  const [index, setIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const total = contacts.length;
  const current = contacts[index];

  function advance() {
    setIndex((i) => i + 1);
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <PartyPopper
          className="mb-3 h-10 w-10 text-teal-500"
          aria-hidden="true"
        />
        <h1 className="font-display text-xl font-semibold text-foreground">
          Nothing due right now
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Come back when someone&apos;s overdue for a catch-up.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          Back to contacts
        </Link>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <PartyPopper
          className="mb-3 h-10 w-10 text-teal-500"
          aria-hidden="true"
        />
        <h1 className="font-display text-xl font-semibold text-foreground">
          All caught up!
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          You triaged {total} {total === 1 ? "person" : "people"}.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          Back to contacts
        </Link>
      </div>
    );
  }

  const style = FOLLOWUP_STYLES[current.status];

  return (
    <div>
      <p className="mb-4 text-center text-sm text-stone-500 dark:text-stone-400">
        {index + 1} of {total}
      </p>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full rounded-full bg-teal-500 transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      <div
        key={current.id}
        className="animate-fade-in-up flex flex-col items-center rounded-3xl border border-stone-200 bg-surface p-6 text-center shadow-sm sm:p-8 dark:border-stone-800"
      >
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold ring-2 ring-offset-2 dark:ring-offset-stone-950 ${style.badge} ${style.ring}`}
        >
          {initials(current.name) || "?"}
        </div>
        <h1 className="font-display text-xl font-semibold text-foreground">
          {current.name}
        </h1>
        {current.company && (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {current.company}
          </p>
        )}
        <div className="mt-2">
          <FollowUpBadge status={current.status} />
        </div>
        <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
          {current.lastContactedAt
            ? `Last contacted ${formatRelativeTime(new Date(current.lastContactedAt))}`
            : "Never contacted"}
        </p>

        <div className="mt-6 w-full rounded-2xl border border-stone-200 bg-background p-4 text-left dark:border-stone-800">
          <LogInteractionForm
            contactId={current.id}
            submitLabel="Log & Next"
            onLogged={advance}
          />
        </div>

        <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <SnoozeSelect
            disabled={isPending}
            className="justify-center"
            onSnooze={(days) =>
              startTransition(async () => {
                await snoozeContact(current.id, days);
                advance();
              })
            }
          />
          <button
            type="button"
            disabled={isPending}
            onClick={advance}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            Skip
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

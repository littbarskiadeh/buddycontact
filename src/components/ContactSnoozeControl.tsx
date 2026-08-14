"use client";

import { useTransition } from "react";
import { snoozeContact, unsnoozeContact } from "@/app/actions";
import { SnoozeSelect } from "@/components/SnoozeSelect";

type ContactSnoozeControlProps = {
  contactId: string;
  isSnoozed: boolean;
};

export function ContactSnoozeControl({
  contactId,
  isSnoozed,
}: ContactSnoozeControlProps) {
  const [isPending, startTransition] = useTransition();

  if (isSnoozed) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await unsnoozeContact(contactId);
          })
        }
        className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        Cancel snooze
      </button>
    );
  }

  return (
    <SnoozeSelect
      disabled={isPending}
      onSnooze={(days) =>
        startTransition(async () => {
          await snoozeContact(contactId, days);
        })
      }
    />
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteContact, logInteraction, toggleFavorite } from "@/app/actions";
import { ContactForm } from "@/components/ContactForm";
import { FollowUpBadge } from "@/components/FollowUpBadge";
import { formatRelativeTime, getFollowUpInfo } from "@/lib/followup";
import type { Contact } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded";

export function ContactCard({ contact }: { contact: Contact }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isEditing) {
    return (
      <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <ContactForm contact={contact} onDone={() => setIsEditing(false)} />
      </li>
    );
  }

  const followUp = getFollowUpInfo({
    cadenceDays: contact.cadenceDays,
    lastContactedAt: contact.lastContactedAt
      ? new Date(contact.lastContactedAt)
      : null,
    createdAt: new Date(contact.createdAt),
  });

  const lastContactedLabel = contact.lastContactedAt
    ? `Contacted ${formatRelativeTime(new Date(contact.lastContactedAt))}`
    : "Never contacted";

  return (
    <li className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
        {initials(contact.name) || "?"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/contacts/${contact.id}`}
            className={`truncate font-semibold text-slate-900 hover:underline dark:text-slate-100 ${focusRing}`}
          >
            {contact.name}
          </Link>
          {contact.favorite && (
            <span role="img" aria-label="Favorite">
              ⭐
            </span>
          )}
          <FollowUpBadge status={followUp.status} />
        </div>

        <dl className="mt-1 space-y-0.5 text-sm text-slate-600 dark:text-slate-400">
          {contact.company && (
            <div className="flex gap-1">
              <dt className="sr-only">Company</dt>
              <dd className="truncate">{contact.company}</dd>
            </div>
          )}
          {contact.email && (
            <div className="flex gap-1">
              <dt className="sr-only">Email</dt>
              <dd className="truncate">{contact.email}</dd>
            </div>
          )}
          {contact.phone && (
            <div className="flex gap-1">
              <dt className="sr-only">Phone</dt>
              <dd className="truncate">{contact.phone}</dd>
            </div>
          )}
        </dl>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {lastContactedLabel}
          {contact.cadenceDays ? ` · every ${contact.cadenceDays} days` : ""}
        </p>

        {contact.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {tag.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await logInteraction(contact.id);
              })
            }
            className={`font-medium text-slate-900 hover:underline disabled:opacity-50 dark:text-slate-100 ${focusRing}`}
          >
            Log Contact
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleFavorite(contact.id, !contact.favorite);
              })
            }
            className={`text-slate-500 hover:text-slate-800 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200 ${focusRing}`}
          >
            {contact.favorite ? "Unfavorite" : "Favorite"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 ${focusRing}`}
          >
            Edit
          </button>
          {confirmingDelete ? (
            <span className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                Delete {contact.name}?
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteContact(contact.id);
                  })
                }
                className={`font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400 ${focusRing}`}
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className={`text-slate-500 hover:underline dark:text-slate-400 ${focusRing}`}
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className={`text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${focusRing}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

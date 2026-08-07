"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, PhoneCall, Pencil, Star, Trash2, X } from "lucide-react";
import { deleteContact, logInteraction, toggleFavorite } from "@/app/actions";
import { ContactForm } from "@/components/ContactForm";
import { FollowUpBadge, FOLLOWUP_STYLES } from "@/components/FollowUpBadge";
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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950 rounded";

const pillButton = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${focusRing}`;

export function ContactCard({ contact }: { contact: Contact }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [justLogged, setJustLogged] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-stone-200 bg-surface p-5 shadow-sm dark:border-stone-800">
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
  const style = FOLLOWUP_STYLES[followUp.status];

  const lastContactedLabel = contact.lastContactedAt
    ? `Contacted ${formatRelativeTime(new Date(contact.lastContactedAt))}`
    : "Never contacted";

  return (
    <li className="group animate-fade-in-up rounded-2xl border border-stone-200 bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ring-2 ring-offset-2 dark:ring-offset-stone-950 ${style.badge} ${style.ring}`}
        >
          {initials(contact.name) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/contacts/${contact.id}`}
              className={`truncate font-display text-lg font-semibold text-foreground hover:underline ${focusRing}`}
            >
              {contact.name}
            </Link>
            {contact.favorite && (
              <Star
                className="h-4 w-4 fill-orange-500 text-orange-500"
                role="img"
                aria-label="Favorite"
              />
            )}
            <FollowUpBadge status={followUp.status} />
          </div>

          <dl className="mt-1 space-y-0.5 text-sm text-stone-600 dark:text-stone-400">
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

          <p className="mt-1 text-xs text-stone-500 dark:text-stone-500">
            {lastContactedLabel}
            {contact.cadenceDays ? ` · every ${contact.cadenceDays} days` : ""}
          </p>

          {contact.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await logInteraction(contact.id);
                  setJustLogged(true);
                  setTimeout(() => setJustLogged(false), 350);
                })
              }
              className={`${pillButton} bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 ${justLogged ? "animate-pulse-once" : ""}`}
            >
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
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
              className={`${pillButton} text-stone-600 hover:bg-stone-100 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-stone-800`}
            >
              <Star
                className={`h-3.5 w-3.5 ${contact.favorite ? "fill-current" : ""}`}
                aria-hidden="true"
              />
              {contact.favorite ? "Unfavorite" : "Favorite"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`${pillButton} text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
            {confirmingDelete ? (
              <span className="flex items-center gap-2">
                <span className="text-stone-500 dark:text-stone-400">
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
                  className={`${pillButton} bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className={`${pillButton} text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={`${pillButton} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

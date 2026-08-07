"use client";

import { useState, useTransition } from "react";
import { deleteContact, toggleFavorite } from "@/app/actions";
import { ContactForm } from "@/components/ContactForm";
import type { Contact } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ContactCard({ contact }: { contact: Contact }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isEditing) {
    return (
      <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <ContactForm contact={contact} onDone={() => setIsEditing(false)} />
      </li>
    );
  }

  return (
    <li className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
        {initials(contact.name) || "?"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
            {contact.name}
          </h3>
          {contact.favorite && (
            <span aria-label="Favorite" title="Favorite">
              ⭐
            </span>
          )}
        </div>

        <dl className="mt-1 space-y-0.5 text-sm text-slate-600 dark:text-slate-400">
          {contact.company && <p>{contact.company}</p>}
          {contact.email && <p>{contact.email}</p>}
          {contact.phone && <p>{contact.phone}</p>}
        </dl>

        {contact.notes && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {contact.notes}
          </p>
        )}

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

        <div className="mt-3 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleFavorite(contact.id, !contact.favorite);
              })
            }
            className="text-slate-500 hover:text-slate-800 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {contact.favorite ? "Unfavorite" : "Favorite"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Delete ${contact.name}?`)) {
                startTransition(async () => {
                  await deleteContact(contact.id);
                });
              }
            }}
            className="text-red-500 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

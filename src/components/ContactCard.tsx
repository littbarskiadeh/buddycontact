"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Check,
  MoreHorizontal,
  Reply,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { deleteContact, snoozeContact, toggleFavorite } from "@/app/actions";
import { CHANNEL_ICONS } from "@/components/channelIcons";
import { ContactForm } from "@/components/ContactForm";
import { FOLLOWUP_STYLES } from "@/components/FollowUpBadge";
import { LogInteractionForm } from "@/components/LogInteractionForm";
import { TopicBubble } from "@/components/TopicBubble";
import { useToast } from "@/components/Toast";
import {
  formatRelativeTime,
  getFollowUpInfo,
  SNOOZE_PRESETS,
} from "@/lib/followup";
import type { Contact } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500";

export function ContactCard({ contact }: { contact: Contact }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  if (isEditing) {
    return (
      <li className="bg-surface p-5">
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
    snoozedUntil: contact.snoozedUntil ? new Date(contact.snoozedUntil) : null,
  });
  const style = FOLLOWUP_STYLES[followUp.status];

  const ChannelIcon = contact.lastInteraction?.channel
    ? CHANNEL_ICONS[contact.lastInteraction.channel]
    : null;

  return (
    <li className="group relative">
      <div className="flex items-start gap-3 p-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/40">
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-base font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {initials(contact.name) || "?"}
          </div>
          <span
            className={`absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${style.dot}`}
            aria-label={style.label}
            role="img"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <Link
              href={`/contacts/${contact.id}`}
              className="truncate rounded font-display font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {contact.name}
            </Link>
            {contact.favorite && (
              <Star
                className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                role="img"
                aria-label="Favorite"
              />
            )}
            <span className="ml-auto shrink-0 pl-2 text-xs text-stone-400 dark:text-stone-500">
              {contact.lastContactedAt
                ? formatRelativeTime(new Date(contact.lastContactedAt))
                : "New"}
            </span>
          </div>

          {contact.lastInteraction ? (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-stone-600 dark:text-stone-400">
              {ChannelIcon && (
                <ChannelIcon
                  className="h-3.5 w-3.5 shrink-0 text-stone-400"
                  aria-hidden="true"
                />
              )}
              <span className="truncate">
                {contact.lastInteraction.note ?? "Logged contact"}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-stone-400 italic dark:text-stone-500">
              No messages yet
            </p>
          )}

          <TopicBubble
            contactId={contact.id}
            initialTopic={contact.suggestedTopic}
          />

          {isLogging && (
            <div className="animate-fade-in-up mt-3 rounded-2xl border border-stone-200 bg-background p-4 dark:border-stone-800">
              <LogInteractionForm
                contactId={contact.id}
                autoFocus
                onLogged={() => {
                  setIsLogging(false);
                  showToast(`Logged contact with ${contact.name}.`);
                }}
                onCancel={() => setIsLogging(false)}
              />
            </div>
          )}

          {confirmingDelete && (
            <div className="animate-fade-in-up mt-3 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/40">
              <span className="flex-1 text-red-800 dark:text-red-300">
                Delete {contact.name}? This can&apos;t be undone.
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteContact(contact.id);
                    showToast(`Deleted ${contact.name}.`);
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {!isLogging && (
            <button
              type="button"
              aria-label="Log Contact"
              title="Log Contact"
              onClick={() => setIsLogging(true)}
              className={iconButton}
            >
              <Reply className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More actions"
              onClick={() => setMenuOpen((open) => !open)}
              className={iconButton}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="animate-fade-in-up absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-stone-200 bg-surface py-1 shadow-lg dark:border-stone-800"
              >
                {contact.cadenceDays &&
                  SNOOZE_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      role="menuitem"
                      disabled={isPending}
                      onClick={() => {
                        setMenuOpen(false);
                        startTransition(async () => {
                          await snoozeContact(contact.id, preset.days);
                          showToast(
                            `Snoozed ${contact.name} for ${preset.label.toLowerCase()}.`,
                          );
                        });
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50 dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      Snooze {preset.label.toLowerCase()}
                    </button>
                  ))}
                <button
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => {
                    setMenuOpen(false);
                    startTransition(async () => {
                      await toggleFavorite(contact.id, !contact.favorite);
                    });
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${contact.favorite ? "fill-amber-400 text-amber-400" : ""}`}
                    aria-hidden="true"
                  />
                  {contact.favorite ? "Unfavorite" : "Favorite"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmingDelete(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

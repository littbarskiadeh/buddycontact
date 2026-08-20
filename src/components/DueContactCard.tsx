"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Reply } from "lucide-react";
import { snoozeContact } from "@/app/actions";
import { CHANNEL_ICONS } from "@/components/channelIcons";
import { FOLLOWUP_STYLES } from "@/components/FollowUpBadge";
import { LogInteractionForm } from "@/components/LogInteractionForm";
import { SnoozeSelect } from "@/components/SnoozeSelect";
import { useToast } from "@/components/Toast";
import { formatRelativeTime, type FollowUpStatus } from "@/lib/followup";
import type { InteractionChannel } from "@/lib/channels";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950 rounded";

type DueContactCardProps = {
  id: string;
  name: string;
  lastContactedAt: string | null;
  status: FollowUpStatus;
  lastInteraction: {
    note: string | null;
    channel: InteractionChannel | null;
  } | null;
};

export function DueContactCard({
  id,
  name,
  lastContactedAt,
  status,
  lastInteraction,
}: DueContactCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const style = FOLLOWUP_STYLES[status];
  const { showToast } = useToast();
  const ChannelIcon = lastInteraction?.channel
    ? CHANNEL_ICONS[lastInteraction.channel]
    : null;

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {initials(name) || "?"}
          </div>
          <span
            className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-surface ${style.dot}`}
            aria-label={style.label}
            role="img"
          />
        </div>

        <div className="min-w-36 flex-1">
          <Link
            href={`/contacts/${id}`}
            className={`truncate font-medium text-foreground hover:underline ${focusRing}`}
          >
            {name}
          </Link>
          <p className="flex items-center gap-1.5 truncate text-xs text-stone-500 dark:text-stone-400">
            {ChannelIcon && (
              <ChannelIcon
                className="h-3 w-3 shrink-0 text-stone-400"
                aria-hidden="true"
              />
            )}
            <span className="truncate" suppressHydrationWarning>
              {lastInteraction?.note ??
                (lastContactedAt
                  ? `Last contacted ${formatRelativeTime(new Date(lastContactedAt))}`
                  : "Never contacted")}
            </span>
          </p>
        </div>

        {!isLogging && (
          <div className="ml-auto flex items-center gap-1.5">
            <SnoozeSelect
              disabled={isPending}
              onSnooze={(days) =>
                startTransition(async () => {
                  await snoozeContact(id, days);
                  showToast(
                    `Snoozed ${name} for ${days} ${days === 1 ? "day" : "days"}.`,
                  );
                })
              }
            />
            <button
              type="button"
              aria-label="Log Contact"
              title="Log Contact"
              onClick={() => setIsLogging(true)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition-colors hover:bg-teal-700 ${focusRing}`}
            >
              <Reply className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {isLogging && (
        <div className="animate-fade-in-up mt-3 rounded-2xl border border-stone-200 bg-background p-4 dark:border-stone-800">
          <LogInteractionForm
            contactId={id}
            autoFocus
            onLogged={() => {
              setIsLogging(false);
              showToast(`Logged contact with ${name}.`);
            }}
            onCancel={() => setIsLogging(false)}
          />
        </div>
      )}
    </li>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PhoneCall } from "lucide-react";
import { logInteraction } from "@/app/actions";
import { FollowUpBadge, FOLLOWUP_STYLES } from "@/components/FollowUpBadge";
import { formatRelativeTime, type FollowUpStatus } from "@/lib/followup";

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

type DueContactCardProps = {
  id: string;
  name: string;
  lastContactedAt: string | null;
  status: FollowUpStatus;
};

export function DueContactCard({
  id,
  name,
  lastContactedAt,
  status,
}: DueContactCardProps) {
  const [justLogged, setJustLogged] = useState(false);
  const [isPending, startTransition] = useTransition();
  const style = FOLLOWUP_STYLES[status];

  return (
    <li
      className={`animate-fade-in-up flex flex-wrap items-center gap-3 rounded-2xl border-t border-r border-b border-t-stone-200 border-r-stone-200 border-b-stone-200 bg-surface p-4 shadow-sm transition-shadow hover:shadow-md dark:border-t-stone-800 dark:border-r-stone-800 dark:border-b-stone-800 border-l-4 ${style.border}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${style.badge}`}
      >
        {initials(name) || "?"}
      </div>

      <div className="min-w-36 flex-1">
        <Link
          href={`/contacts/${id}`}
          className={`truncate font-medium text-foreground hover:underline ${focusRing}`}
        >
          {name}
        </Link>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {lastContactedAt
            ? `Last contacted ${formatRelativeTime(new Date(lastContactedAt))}`
            : "Never contacted"}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <FollowUpBadge status={status} />

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await logInteraction(id);
              setJustLogged(true);
              setTimeout(() => setJustLogged(false), 350);
            })
          }
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 ${focusRing} ${justLogged ? "animate-pulse-once" : ""}`}
        >
          <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
          Log Contact
        </button>
      </div>
    </li>
  );
}

import type { FollowUpStatus } from "@/lib/followup";

export const FOLLOWUP_STYLES: Record<
  FollowUpStatus,
  {
    label: string;
    badge: string;
    dot: string;
    ring: string;
    border: string;
  }
> = {
  overdue: {
    label: "Gone cold",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    dot: "bg-sky-500",
    ring: "ring-sky-400 dark:ring-sky-500",
    border: "border-l-sky-400 dark:border-l-sky-500",
  },
  "due-soon": {
    label: "Cooling",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
    ring: "ring-amber-400 dark:ring-amber-500",
    border: "border-l-amber-400 dark:border-l-amber-500",
  },
  "on-track": {
    label: "Warm",
    badge:
      "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    dot: "bg-orange-500",
    ring: "ring-orange-400 dark:ring-orange-500",
    border: "border-l-orange-400 dark:border-l-orange-500",
  },
  "no-cadence": {
    label: "Untracked",
    badge: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
    dot: "bg-stone-400",
    ring: "ring-stone-300 dark:ring-stone-600",
    border: "border-l-stone-300 dark:border-l-stone-600",
  },
  snoozed: {
    label: "Snoozed",
    badge:
      "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    dot: "bg-violet-500",
    ring: "ring-violet-400 dark:ring-violet-500",
    border: "border-l-violet-400 dark:border-l-violet-500",
  },
};

export function FollowUpBadge({ status }: { status: FollowUpStatus }) {
  const { label, badge, dot } = FOLLOWUP_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

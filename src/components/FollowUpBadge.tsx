import type { FollowUpStatus } from "@/lib/followup";

const STYLES: Record<FollowUpStatus, { label: string; className: string }> = {
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  "due-soon": {
    label: "Due soon",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  "on-track": {
    label: "On track",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  "no-cadence": {
    label: "No reminder",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

export function FollowUpBadge({ status }: { status: FollowUpStatus }) {
  const { label, className } = STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

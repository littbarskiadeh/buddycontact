import { formatRelativeTime } from "@/lib/followup";
import type { Interaction } from "@/types";

export function InteractionTimeline({
  interactions,
}: {
  interactions: Interaction[];
}) {
  if (interactions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No contact logged yet. Use the form above once you reach out.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {interactions.map((interaction) => {
        const occurredAt = new Date(interaction.occurredAt);
        return (
          <li
            key={interaction.id}
            className="border-l-2 border-slate-200 pl-4 dark:border-slate-800"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <time dateTime={occurredAt.toISOString()}>
                {formatRelativeTime(occurredAt)}
              </time>
            </p>
            <p className="text-sm text-slate-700 break-words dark:text-slate-300">
              {interaction.note ?? "Logged contact"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

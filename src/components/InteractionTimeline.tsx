import { formatRelativeTime } from "@/lib/followup";
import type { Interaction } from "@/types";

export function InteractionTimeline({
  interactions,
}: {
  interactions: Interaction[];
}) {
  if (interactions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
        No contact logged yet. Use the form above once you reach out.
      </p>
    );
  }

  return (
    <ol className="space-y-5 border-l-2 border-stone-200 dark:border-stone-800">
      {interactions.map((interaction) => {
        const occurredAt = new Date(interaction.occurredAt);
        return (
          <li key={interaction.id} className="relative pl-5">
            <span
              className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-orange-500"
              aria-hidden="true"
            />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              <time dateTime={occurredAt.toISOString()}>
                {formatRelativeTime(occurredAt)}
              </time>
            </p>
            <p className="text-sm break-words text-stone-700 dark:text-stone-300">
              {interaction.note ?? "Logged contact"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

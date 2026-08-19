import { History } from "lucide-react";
import { CHANNEL_ICONS } from "@/components/channelIcons";
import { CHANNEL_LABELS } from "@/lib/channels";
import { formatRelativeTime } from "@/lib/followup";
import type { Interaction } from "@/types";

export function InteractionTimeline({
  interactions,
}: {
  interactions: Interaction[];
}) {
  if (interactions.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 p-8 text-center dark:border-stone-700">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          <History className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          No messages yet. Log Contact once you reach out.
        </p>
      </div>
    );
  }

  // Query order is newest-first everywhere else in the app; a chat thread
  // reads oldest-to-newest, most recent at the bottom.
  const chronological = [...interactions].reverse();

  return (
    <ol className="flex flex-col gap-2.5">
      {chronological.map((interaction) => {
        const occurredAt = new Date(interaction.occurredAt);
        const ChannelIcon = interaction.channel
          ? CHANNEL_ICONS[interaction.channel]
          : null;
        return (
          <li key={interaction.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-teal-600 px-4 py-2.5 text-white sm:max-w-[70%]">
              <p className="text-sm break-words">
                {interaction.note ?? "Logged contact"}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-teal-100">
                {ChannelIcon && (
                  <ChannelIcon className="h-3 w-3" aria-hidden="true" />
                )}
                {interaction.channel && CHANNEL_LABELS[interaction.channel]}
                <time dateTime={occurredAt.toISOString()}>
                  {interaction.channel ? " · " : ""}
                  {formatRelativeTime(occurredAt)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import { Flame, PartyPopper } from "lucide-react";

type WeeklyRecapProps = {
  contactedThisWeek: number;
  streakWeeks: number;
};

export function WeeklyRecap({
  contactedThisWeek,
  streakWeeks,
}: WeeklyRecapProps) {
  if (contactedThisWeek === 0 && streakWeeks === 0) {
    return null;
  }

  const peopleLabel = contactedThisWeek === 1 ? "person" : "people";

  return (
    <div className="animate-fade-in-up flex flex-wrap items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm dark:border-orange-900 dark:bg-orange-950/40">
      <PartyPopper
        className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400"
        aria-hidden="true"
      />
      <p className="text-orange-900 dark:text-orange-200">
        {contactedThisWeek > 0 ? (
          <>
            You&apos;ve reconnected with{" "}
            <strong className="font-semibold">
              {contactedThisWeek} {peopleLabel}
            </strong>{" "}
            this week.
          </>
        ) : (
          <>No one logged yet this week — plenty of time still.</>
        )}
        {streakWeeks >= 2 && (
          <span className="ml-1 inline-flex items-center gap-1 font-semibold">
            <Flame className="h-4 w-4" aria-hidden="true" />
            {streakWeeks}-week streak
          </span>
        )}
      </p>
    </div>
  );
}

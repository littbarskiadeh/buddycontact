const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const DUE_SOON_WINDOW_DAYS = 3;

/**
 * A plain helper (not a component/hook) so calling Date.now() here doesn't
 * trip the react-hooks/purity rule at call sites inside Server Components.
 */
export function getRecapCutoffDate(lookbackDays: number): Date {
  return new Date(Date.now() - lookbackDays * DAY_MS);
}

export type FollowUpStatus =
  "overdue" | "due-soon" | "on-track" | "no-cadence" | "snoozed";

export type FollowUpInfo = {
  status: FollowUpStatus;
  dueAt: Date | null;
  daysUntilDue: number | null;
};

type FollowUpContact = {
  cadenceDays: number | null;
  lastContactedAt: Date | null;
  createdAt: Date;
  snoozedUntil?: Date | null;
};

export function getFollowUpInfo(
  contact: FollowUpContact,
  now: Date = new Date(),
): FollowUpInfo {
  if (contact.snoozedUntil && contact.snoozedUntil.getTime() > now.getTime()) {
    return {
      status: "snoozed",
      dueAt: contact.snoozedUntil,
      daysUntilDue: null,
    };
  }

  if (!contact.cadenceDays) {
    return { status: "no-cadence", dueAt: null, daysUntilDue: null };
  }

  const anchor = contact.lastContactedAt ?? contact.createdAt;
  const dueAt = new Date(anchor.getTime() + contact.cadenceDays * DAY_MS);
  const daysUntilDue = Math.ceil((dueAt.getTime() - now.getTime()) / DAY_MS);

  if (daysUntilDue < 0) {
    return { status: "overdue", dueAt, daysUntilDue };
  }
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) {
    return { status: "due-soon", dueAt, daysUntilDue };
  }
  return { status: "on-track", dueAt, daysUntilDue };
}

export function compareFollowUpUrgency(
  a: FollowUpInfo,
  b: FollowUpInfo,
): number {
  const rank: Record<FollowUpStatus, number> = {
    overdue: 0,
    "due-soon": 1,
    "on-track": 2,
    "no-cadence": 3,
    snoozed: 4,
  };

  if (rank[a.status] !== rank[b.status]) {
    return rank[a.status] - rank[b.status];
  }
  if (a.daysUntilDue === null || b.daysUntilDue === null) return 0;
  return a.daysUntilDue - b.daysUntilDue;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / DAY_MS);

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.round(diffMs / (60 * 1000));
      return relativeTimeFormatter.format(diffMinutes, "minute");
    }
    return relativeTimeFormatter.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 30) {
    return relativeTimeFormatter.format(diffDays, "day");
  }
  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return relativeTimeFormatter.format(diffMonths, "month");
  }
  const diffYears = Math.round(diffDays / 365);
  return relativeTimeFormatter.format(diffYears, "year");
}

export const CADENCE_PRESETS: { label: string; days: number }[] = [
  { label: "Every week", days: 7 },
  { label: "Every 2 weeks", days: 14 },
  { label: "Every month", days: 30 },
  { label: "Every 3 months", days: 90 },
  { label: "Every 6 months", days: 180 },
];

export const SNOOZE_PRESETS: { label: string; days: number }[] = [
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
];

export type WeeklyRecap = {
  /** Distinct contacts logged in the last 7 days. */
  contactedThisWeek: number;
  /**
   * Consecutive weeks (rolling 7-day buckets, most recent first) with at
   * least one logged interaction. Tolerates exactly one missed week per
   * streak (a "grace" week) so a single busy week doesn't reset progress —
   * see the ethical-gamification note in getWeeklyRecap.
   */
  streakWeeks: number;
};

/**
 * Computed, not stored: a streak with a built-in one-time grace period per
 * break, rather than a manually-invoked "streak freeze". Research on
 * ethical engagement design (Duolingo's streak-freeze mechanic) shows
 * unforgiving streaks create anxiety without improving the underlying
 * behavior — tolerating one gap keeps the encouragement without the guilt.
 */
export function getWeeklyRecap(
  interactions: { contactId: string; occurredAt: Date }[],
  now: Date = new Date(),
): WeeklyRecap {
  const currentWeekStart = now.getTime() - WEEK_MS;
  const contactedThisWeek = new Set(
    interactions
      .filter((i) => i.occurredAt.getTime() >= currentWeekStart)
      .map((i) => i.contactId),
  ).size;

  let streakWeeks = 0;
  let graceUsed = false;
  let weekEnd = now.getTime();
  let isCurrentWeek = true;

  // Walk backward one rolling week at a time. Cap the lookback so an old,
  // sparsely-logged account doesn't loop indefinitely.
  for (let i = 0; i < 104; i++) {
    const weekStart = weekEnd - WEEK_MS;
    const hasActivity = interactions.some(
      (interaction) =>
        interaction.occurredAt.getTime() >= weekStart &&
        interaction.occurredAt.getTime() < weekEnd,
    );

    if (hasActivity) {
      streakWeeks++;
    } else if (isCurrentWeek) {
      // The current week isn't over yet — don't break the streak for it,
      // just don't count it either.
    } else if (!graceUsed) {
      graceUsed = true;
    } else {
      break;
    }

    isCurrentWeek = false;
    weekEnd = weekStart;
  }

  return { contactedThisWeek, streakWeeks };
}

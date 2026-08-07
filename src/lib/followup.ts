const DAY_MS = 24 * 60 * 60 * 1000;
const DUE_SOON_WINDOW_DAYS = 3;

export type FollowUpStatus = "overdue" | "due-soon" | "on-track" | "no-cadence";

export type FollowUpInfo = {
  status: FollowUpStatus;
  dueAt: Date | null;
  daysUntilDue: number | null;
};

type FollowUpContact = {
  cadenceDays: number | null;
  lastContactedAt: Date | null;
  createdAt: Date;
};

export function getFollowUpInfo(
  contact: FollowUpContact,
  now: Date = new Date(),
): FollowUpInfo {
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

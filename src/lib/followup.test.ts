import { describe, expect, it } from "vitest";
import {
  compareFollowUpUrgency,
  formatRelativeTime,
  getFollowUpInfo,
} from "@/lib/followup";

const NOW = new Date("2026-08-15T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("getFollowUpInfo", () => {
  it("returns no-cadence when cadenceDays is not set", () => {
    const info = getFollowUpInfo(
      { cadenceDays: null, lastContactedAt: null, createdAt: NOW },
      NOW,
    );
    expect(info.status).toBe("no-cadence");
    expect(info.dueAt).toBeNull();
  });

  it("anchors on lastContactedAt when present", () => {
    const lastContactedAt = new Date(NOW.getTime() - 10 * DAY_MS);
    const info = getFollowUpInfo(
      { cadenceDays: 14, lastContactedAt, createdAt: NOW },
      NOW,
    );
    // 10 days since contact, cadence 14 -> due in 4 days -> on-track (outside 3-day window)
    expect(info.status).toBe("on-track");
    expect(info.daysUntilDue).toBe(4);
  });

  it("anchors on createdAt when never contacted", () => {
    const createdAt = new Date(NOW.getTime() - 20 * DAY_MS);
    const info = getFollowUpInfo(
      { cadenceDays: 14, lastContactedAt: null, createdAt },
      NOW,
    );
    expect(info.status).toBe("overdue");
  });

  it("flags overdue when past the due date", () => {
    const lastContactedAt = new Date(NOW.getTime() - 30 * DAY_MS);
    const info = getFollowUpInfo(
      { cadenceDays: 14, lastContactedAt, createdAt: NOW },
      NOW,
    );
    expect(info.status).toBe("overdue");
    expect(info.daysUntilDue).toBeLessThan(0);
  });

  it("flags due-soon within the 3-day window", () => {
    const lastContactedAt = new Date(NOW.getTime() - 12 * DAY_MS);
    const info = getFollowUpInfo(
      { cadenceDays: 14, lastContactedAt, createdAt: NOW },
      NOW,
    );
    expect(info.status).toBe("due-soon");
    expect(info.daysUntilDue).toBe(2);
  });

  it("flags on-track when comfortably before the due date", () => {
    const lastContactedAt = new Date(NOW.getTime() - 1 * DAY_MS);
    const info = getFollowUpInfo(
      { cadenceDays: 14, lastContactedAt, createdAt: NOW },
      NOW,
    );
    expect(info.status).toBe("on-track");
  });
});

describe("compareFollowUpUrgency", () => {
  it("orders overdue before due-soon before on-track before no-cadence", () => {
    const overdue = getFollowUpInfo(
      {
        cadenceDays: 14,
        lastContactedAt: new Date(NOW.getTime() - 30 * DAY_MS),
        createdAt: NOW,
      },
      NOW,
    );
    const dueSoon = getFollowUpInfo(
      {
        cadenceDays: 14,
        lastContactedAt: new Date(NOW.getTime() - 12 * DAY_MS),
        createdAt: NOW,
      },
      NOW,
    );
    const onTrack = getFollowUpInfo(
      {
        cadenceDays: 14,
        lastContactedAt: new Date(NOW.getTime() - 1 * DAY_MS),
        createdAt: NOW,
      },
      NOW,
    );
    const noCadence = getFollowUpInfo(
      { cadenceDays: null, lastContactedAt: null, createdAt: NOW },
      NOW,
    );

    const sorted = [noCadence, onTrack, overdue, dueSoon].sort(
      compareFollowUpUrgency,
    );
    expect(sorted).toEqual([overdue, dueSoon, onTrack, noCadence]);
  });

  it("within the same status, sorts the most overdue first", () => {
    const veryOverdue = getFollowUpInfo(
      {
        cadenceDays: 14,
        lastContactedAt: new Date(NOW.getTime() - 60 * DAY_MS),
        createdAt: NOW,
      },
      NOW,
    );
    const slightlyOverdue = getFollowUpInfo(
      {
        cadenceDays: 14,
        lastContactedAt: new Date(NOW.getTime() - 15 * DAY_MS),
        createdAt: NOW,
      },
      NOW,
    );

    const sorted = [slightlyOverdue, veryOverdue].sort(compareFollowUpUrgency);
    expect(sorted).toEqual([veryOverdue, slightlyOverdue]);
  });
});

describe("formatRelativeTime", () => {
  it("formats past days", () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 3 * DAY_MS), NOW)).toBe(
      "3 days ago",
    );
  });

  it("formats future days", () => {
    expect(formatRelativeTime(new Date(NOW.getTime() + 2 * DAY_MS), NOW)).toBe(
      "in 2 days",
    );
  });

  it("formats recent minutes", () => {
    expect(
      formatRelativeTime(new Date(NOW.getTime() - 5 * 60 * 1000), NOW),
    ).toBe("5 minutes ago");
  });

  it("formats months for older dates", () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 60 * DAY_MS), NOW)).toBe(
      "2 months ago",
    );
  });
});

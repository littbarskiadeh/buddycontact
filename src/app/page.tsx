import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AddContactPanel } from "@/components/AddContactPanel";
import { ContactList } from "@/components/ContactList";
import { DueContactCard } from "@/components/DueContactCard";
import { QuickLogButton } from "@/components/QuickLogButton";
import { SearchBar } from "@/components/SearchBar";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import {
  compareFollowUpUrgency,
  getFollowUpInfo,
  getRecapCutoffDate,
  getWeeklyRecap,
} from "@/lib/followup";

const RECAP_LOOKBACK_DAYS = 210;

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { q, tag } = await searchParams;

  const [contacts, tags, recentInteractions] = await Promise.all([
    prisma.contact.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q } },
                  { email: { contains: q } },
                  { company: { contains: q } },
                ],
              }
            : {},
          tag ? { tags: { some: { name: tag } } } : {},
        ],
      },
      include: { tags: true },
      orderBy: [{ favorite: "desc" }, { name: "asc" }],
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.interaction.findMany({
      where: { occurredAt: { gte: getRecapCutoffDate(RECAP_LOOKBACK_DAYS) } },
      select: { contactId: true, occurredAt: true },
    }),
  ]);

  const serializedContacts = contacts.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastContactedAt: c.lastContactedAt ? c.lastContactedAt.toISOString() : null,
    snoozedUntil: c.snoozedUntil ? c.snoozedUntil.toISOString() : null,
  }));

  const dueContacts = contacts
    .map((contact) => ({
      contact,
      followUp: getFollowUpInfo({
        cadenceDays: contact.cadenceDays,
        lastContactedAt: contact.lastContactedAt,
        createdAt: contact.createdAt,
        snoozedUntil: contact.snoozedUntil,
      }),
    }))
    .filter(
      ({ followUp }) =>
        followUp.status === "overdue" || followUp.status === "due-soon",
    )
    .sort((a, b) => compareFollowUpUrgency(a.followUp, b.followUp));

  const recap = getWeeklyRecap(recentInteractions);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(13,148,136,0.16),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(13,148,136,0.18),transparent)]"
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-balance font-display text-4xl font-semibold text-foreground">
              Who do you owe a hello?
            </h1>
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              Never lose touch with the people who matter.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <QuickLogButton contacts={serializedContacts} />
            <AddContactPanel />
          </div>
        </header>

        <div className="mb-10">
          <WeeklyRecap
            contactedThisWeek={recap.contactedThisWeek}
            streakWeeks={recap.streakWeeks}
          />
        </div>

        {dueContacts.length > 0 && (
          <section className="mb-10" aria-labelledby="due-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="due-heading"
                className="text-sm font-semibold tracking-wide text-stone-700 uppercase dark:text-stone-300"
              >
                Due for follow-up ({dueContacts.length})
              </h2>
              <Link
                href="/triage"
                className="rounded text-sm font-medium text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
              >
                Start triage →
              </Link>
            </div>
            <ul className="space-y-2.5">
              {dueContacts.map(({ contact, followUp }) => (
                <DueContactCard
                  key={contact.id}
                  id={contact.id}
                  name={contact.name}
                  lastContactedAt={
                    contact.lastContactedAt
                      ? contact.lastContactedAt.toISOString()
                      : null
                  }
                  status={followUp.status}
                />
              ))}
            </ul>
          </section>
        )}

        <div className="mb-6">
          <Suspense>
            <SearchBar tags={tags} />
          </Suspense>
        </div>

        <ContactList contacts={serializedContacts} />
      </main>
    </div>
  );
}

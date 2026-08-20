import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
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
import type { InteractionChannel } from "@/lib/channels";

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
      include: {
        tags: true,
        interactions: { orderBy: { occurredAt: "desc" }, take: 1 },
      },
      orderBy: [{ favorite: "desc" }, { name: "asc" }],
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.interaction.findMany({
      where: { occurredAt: { gte: getRecapCutoffDate(RECAP_LOOKBACK_DAYS) } },
      select: { contactId: true, occurredAt: true },
    }),
  ]);

  const serializedContacts = contacts.map((c) => {
    const [latest] = c.interactions;
    return {
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      lastContactedAt: c.lastContactedAt
        ? c.lastContactedAt.toISOString()
        : null,
      snoozedUntil: c.snoozedUntil ? c.snoozedUntil.toISOString() : null,
      lastInteraction: latest
        ? {
            note: latest.note,
            channel: latest.channel as InteractionChannel | null,
          }
        : null,
    };
  });

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
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Conversations
          </h1>
          <p className="mt-0.5 text-stone-500 dark:text-stone-400">
            {contacts.length} {contacts.length === 1 ? "person" : "people"}{" "}
            you&apos;re keeping up with
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuickLogButton contacts={serializedContacts} />
          <AddContactPanel />
        </div>
      </header>

      <div className="mb-6">
        <WeeklyRecap
          contactedThisWeek={recap.contactedThisWeek}
          streakWeeks={recap.streakWeeks}
        />
      </div>

      {dueContacts.length > 0 && (
        <section className="mb-7" aria-labelledby="due-heading">
          <div className="mb-2.5 flex items-center justify-between">
            <h2
              id="due-heading"
              className="text-sm font-semibold tracking-wide text-stone-700 uppercase dark:text-stone-300"
            >
              Needs a reply ({dueContacts.length})
            </h2>
            <Link
              href="/triage"
              className="inline-flex items-center gap-0.5 rounded text-sm font-medium text-teal-700 transition-transform hover:underline active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
            >
              Start triage
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="shadow-elevated divide-y divide-stone-100 overflow-hidden rounded-3xl bg-surface dark:divide-stone-800">
            {dueContacts.map(({ contact, followUp }) => {
              const [latest] = contact.interactions;
              return (
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
                  lastInteraction={
                    latest
                      ? {
                          note: latest.note,
                          channel: latest.channel as InteractionChannel | null,
                        }
                      : null
                  }
                />
              );
            })}
          </ul>
        </section>
      )}

      <div className="mb-4">
        <Suspense>
          <SearchBar tags={tags} />
        </Suspense>
      </div>

      <ContactList
        contacts={serializedContacts}
        hasFilters={Boolean(q || tag)}
      />
    </main>
  );
}

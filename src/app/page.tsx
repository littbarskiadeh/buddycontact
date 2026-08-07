import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AddContactPanel } from "@/components/AddContactPanel";
import { ContactList } from "@/components/ContactList";
import { FollowUpBadge } from "@/components/FollowUpBadge";
import { SearchBar } from "@/components/SearchBar";
import {
  compareFollowUpUrgency,
  getFollowUpInfo,
  formatRelativeTime,
} from "@/lib/followup";

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { q, tag } = await searchParams;

  const [contacts, tags] = await Promise.all([
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
  ]);

  const serializedContacts = contacts.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastContactedAt: c.lastContactedAt ? c.lastContactedAt.toISOString() : null,
  }));

  const dueContacts = contacts
    .map((contact) => ({
      contact,
      followUp: getFollowUpInfo({
        cadenceDays: contact.cadenceDays,
        lastContactedAt: contact.lastContactedAt,
        createdAt: contact.createdAt,
      }),
    }))
    .filter(
      ({ followUp }) =>
        followUp.status === "overdue" || followUp.status === "due-soon",
    )
    .sort((a, b) => compareFollowUpUrgency(a.followUp, b.followUp));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            BuddyContact
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Never lose touch with the people who matter.
          </p>
        </div>
        <AddContactPanel />
      </header>

      {dueContacts.length > 0 && (
        <section className="mb-8" aria-labelledby="due-heading">
          <h2
            id="due-heading"
            className="mb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-300"
          >
            Due for follow-up ({dueContacts.length})
          </h2>
          <ul className="space-y-2">
            {dueContacts.map(({ contact, followUp }) => (
              <li
                key={contact.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="min-w-0">
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="truncate font-medium text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:text-slate-100"
                  >
                    {contact.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {contact.lastContactedAt
                      ? `Last contacted ${formatRelativeTime(contact.lastContactedAt)}`
                      : "Never contacted"}
                  </p>
                </div>
                <FollowUpBadge status={followUp.status} />
              </li>
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
  );
}

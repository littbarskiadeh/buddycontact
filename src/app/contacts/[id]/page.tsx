import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContactSnoozeControl } from "@/components/ContactSnoozeControl";
import { FollowUpBadge, FOLLOWUP_STYLES } from "@/components/FollowUpBadge";
import { InteractionTimeline } from "@/components/InteractionTimeline";
import { LogInteractionForm } from "@/components/LogInteractionForm";
import { TopicSuggestions } from "@/components/TopicSuggestions";
import type { InteractionChannel } from "@/lib/channels";
import { formatRelativeTime, getFollowUpInfo } from "@/lib/followup";

type PageProps = {
  params: Promise<{ id: string }>;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Deduplicated per-request: generateMetadata and the page body both call
// this, but React.cache() ensures it only hits the database once.
const getContact = cache((id: string) =>
  prisma.contact.findUnique({
    where: { id },
    include: {
      tags: true,
      interactions: { orderBy: { occurredAt: "desc" } },
    },
  }),
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const contact = await getContact(id);
  return { title: contact?.name ?? "Contact not found" };
}

export default async function ContactDetail({ params }: PageProps) {
  const { id } = await params;

  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const followUp = getFollowUpInfo({
    cadenceDays: contact.cadenceDays,
    lastContactedAt: contact.lastContactedAt,
    createdAt: contact.createdAt,
    snoozedUntil: contact.snoozedUntil,
  });
  const style = FOLLOWUP_STYLES[followUp.status];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 rounded text-sm text-stone-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-stone-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to contacts
      </Link>

      <header className="animate-fade-in-up mb-6 flex items-start gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold ring-2 ring-offset-2 dark:ring-offset-stone-950 ${style.badge} ${style.ring}`}
        >
          {initials(contact.name) || "?"}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-balance font-display text-2xl font-semibold text-foreground">
              {contact.name}
            </h1>
            {contact.favorite && (
              <Star
                className="h-4 w-4 fill-orange-500 text-orange-500"
                role="img"
                aria-label="Favorite"
              />
            )}
            <FollowUpBadge status={followUp.status} />
            {contact.cadenceDays && (
              <ContactSnoozeControl
                contactId={contact.id}
                isSnoozed={followUp.status === "snoozed"}
              />
            )}
          </div>

          <dl className="mt-2 space-y-0.5 text-sm text-stone-600 dark:text-stone-400">
            {contact.company && (
              <div>
                <dt className="sr-only">Company</dt>
                <dd className="break-words">{contact.company}</dd>
              </div>
            )}
            {contact.email && (
              <div>
                <dt className="sr-only">Email</dt>
                <dd className="break-words">{contact.email}</dd>
              </div>
            )}
            {contact.phone && (
              <div>
                <dt className="sr-only">Phone</dt>
                <dd className="break-words">{contact.phone}</dd>
              </div>
            )}
          </dl>

          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {contact.lastContactedAt
              ? `Last contacted ${formatRelativeTime(contact.lastContactedAt)}`
              : "Never contacted"}
            {contact.cadenceDays
              ? ` · reminder every ${contact.cadenceDays} days`
              : " · no reminder set"}
          </p>

          {contact.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="mb-8">
        <TopicSuggestions contactId={contact.id} contactName={contact.name} />
      </div>

      <section className="mb-8 rounded-2xl border border-stone-200 bg-surface p-5 shadow-sm dark:border-stone-800">
        <h2 className="mb-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
          Log Contact
        </h2>
        <LogInteractionForm contactId={contact.id} />
      </section>

      <section aria-labelledby="history-heading">
        <h2
          id="history-heading"
          className="mb-3 text-sm font-semibold tracking-wide text-stone-700 uppercase dark:text-stone-300"
        >
          History
        </h2>
        <InteractionTimeline
          interactions={contact.interactions.map((i) => ({
            ...i,
            channel: i.channel as InteractionChannel | null,
            occurredAt: i.occurredAt.toISOString(),
            createdAt: i.createdAt.toISOString(),
          }))}
        />
      </section>
    </main>
  );
}

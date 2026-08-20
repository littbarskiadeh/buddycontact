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
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 rounded text-sm text-stone-500 transition-transform hover:underline active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-stone-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      <header className="animate-fade-in-up mb-7 flex items-start gap-4 border-b border-stone-200/70 pb-6 dark:border-stone-800/70">
        <div className="relative shrink-0">
          <div className="shadow-elevated flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-xl font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {initials(contact.name) || "?"}
          </div>
          <span
            className={`absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2 border-background ${style.dot}`}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-balance font-display text-2xl font-semibold tracking-tight text-foreground">
              {contact.name}
            </h1>
            {contact.favorite && (
              <Star
                className="h-4 w-4 fill-amber-400 text-amber-400"
                role="img"
                aria-label="Favorite"
              />
            )}
          </div>

          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            {[contact.company, contact.email, contact.phone]
              .filter(Boolean)
              .join(" · ") || "No details added"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <FollowUpBadge status={followUp.status} />
            {contact.cadenceDays && (
              <ContactSnoozeControl
                contactId={contact.id}
                isSnoozed={followUp.status === "snoozed"}
              />
            )}
            {contact.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <p
            className="mt-2 text-xs text-stone-400 dark:text-stone-500"
            suppressHydrationWarning
          >
            {contact.lastContactedAt
              ? `Last contacted ${formatRelativeTime(contact.lastContactedAt)}`
              : "Never contacted"}
            {contact.cadenceDays
              ? ` · reminder every ${contact.cadenceDays} days`
              : " · no reminder set"}
          </p>
        </div>
      </header>

      <section aria-labelledby="history-heading" className="mb-4">
        <h2 id="history-heading" className="sr-only">
          Message history
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

      <div className="mb-3">
        <TopicSuggestions contactId={contact.id} contactName={contact.name} />
      </div>

      <LogInteractionForm contactId={contact.id} />
    </main>
  );
}

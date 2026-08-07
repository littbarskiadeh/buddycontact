import type { Metadata } from "next";
import { getDueContacts } from "@/lib/due-contacts";
import { TriageFlow, type TriageContact } from "@/components/TriageFlow";

export const metadata: Metadata = { title: "Triage" };

// Who's due changes on every interaction/snooze — never serve a cached
// build-time snapshot, unlike "/" this route has no searchParams to force
// dynamic rendering implicitly.
export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const dueContacts = await getDueContacts();

  const contacts: TriageContact[] = dueContacts.map(
    ({ contact, followUp }) => ({
      id: contact.id,
      name: contact.name,
      company: contact.company,
      lastContactedAt: contact.lastContactedAt
        ? contact.lastContactedAt.toISOString()
        : null,
      cadenceDays: contact.cadenceDays,
      status: followUp.status,
    }),
  );

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <TriageFlow contacts={contacts} />
    </main>
  );
}

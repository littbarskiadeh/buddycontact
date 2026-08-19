import { SearchX } from "lucide-react";
import { AddContactPanel } from "@/components/AddContactPanel";
import { ContactCard } from "@/components/ContactCard";
import type { Contact } from "@/types";

type ContactListProps = {
  contacts: Contact[];
  hasFilters?: boolean;
};

export function ContactList({
  contacts,
  hasFilters = false,
}: ContactListProps) {
  if (contacts.length === 0) {
    if (hasFilters) {
      return (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 p-10 text-center dark:border-stone-700">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
            <SearchX className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No contacts match that search. Try a different name or clear the
            filter.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 p-10 text-center dark:border-stone-700">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, no optimization needed */}
        <img
          src="/empty-contacts.svg"
          alt=""
          aria-hidden="true"
          className="mb-4 h-32 w-32"
        />
        <h3 className="font-display text-lg font-semibold text-foreground">
          No contacts yet
        </h3>
        <p className="mt-1 max-w-xs text-sm text-stone-500 dark:text-stone-400">
          Add the first person you don&apos;t want to lose touch with.
        </p>
        <div className="mt-4">
          <AddContactPanel />
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-surface dark:divide-stone-800 dark:border-stone-800">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </ul>
  );
}

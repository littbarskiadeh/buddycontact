import { Users } from "lucide-react";
import { ContactCard } from "@/components/ContactCard";
import type { Contact } from "@/types";

export function ContactList({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 p-10 text-center dark:border-stone-700">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          <Users className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          No contacts found. Add one above or try a different search.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </ul>
  );
}

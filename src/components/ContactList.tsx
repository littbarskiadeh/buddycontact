import { ContactCard } from "@/components/ContactCard";
import type { Contact } from "@/types";

export function ContactList({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
        No contacts found. Add one above or try a different search.
      </p>
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

import { ContactCard } from "@/components/ContactCard";
import type { Contact } from "@/types";

export function ContactList({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
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

"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export function AddContactPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950"
      >
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Add Contact
      </button>
    );
  }

  return (
    <div className="animate-fade-in-up w-full rounded-2xl border border-stone-200 bg-surface p-5 shadow-sm dark:border-stone-800">
      <ContactForm onDone={() => setIsOpen(false)} />
    </div>
  );
}

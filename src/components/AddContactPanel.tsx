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
        className="shadow-elevated inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950"
      >
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Add Contact
      </button>
    );
  }

  return (
    <div className="animate-fade-in-up shadow-elevated w-full rounded-3xl bg-surface p-5">
      <ContactForm onDone={() => setIsOpen(false)} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { ContactForm } from "@/components/ContactForm";

export function AddContactPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
      >
        + Add contact
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <ContactForm onDone={() => setIsOpen(false)} />
    </div>
  );
}

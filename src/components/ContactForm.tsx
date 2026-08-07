"use client";

import { useId, useState, useTransition } from "react";
import { createContact, updateContact } from "@/app/actions";
import type { Contact, ContactFormValues } from "@/types";

const emptyValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
  favorite: false,
  tags: "",
};

function toFormValues(contact: Contact): ContactFormValues {
  return {
    name: contact.name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
    notes: contact.notes ?? "",
    favorite: contact.favorite,
    tags: contact.tags.map((t) => t.name).join(", "),
  };
}

type ContactFormProps = {
  contact?: Contact;
  onDone?: () => void;
};

export function ContactForm({ contact, onDone }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(
    contact ? toFormValues(contact) : emptyValues,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const notesId = useId();

  function update<K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = contact
        ? await updateContact(contact.id, values)
        : await createContact(values);

      if (!result.success) {
        setFormError(result.error ?? "Something went wrong.");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (!contact) {
        setValues(emptyValues);
      }
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {formError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Name"
          required
          value={values.name}
          onChange={(v) => update("name", v)}
          errors={fieldErrors.name}
        />
        <Field
          label="Email"
          type="email"
          value={values.email}
          onChange={(v) => update("email", v)}
          errors={fieldErrors.email}
        />
        <Field
          label="Phone"
          value={values.phone}
          onChange={(v) => update("phone", v)}
          errors={fieldErrors.phone}
        />
        <Field
          label="Company"
          value={values.company}
          onChange={(v) => update("company", v)}
          errors={fieldErrors.company}
        />
      </div>

      <Field
        label="Tags (comma-separated)"
        value={values.tags}
        onChange={(v) => update("tags", v)}
        errors={fieldErrors.tags}
        placeholder="friend, work, client"
      />

      <div>
        <label
          htmlFor={notesId}
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Notes
        </label>
        <textarea
          id={notesId}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900"
          rows={3}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={values.favorite}
          onChange={(e) => update("favorite", e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Mark as favorite
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          {isPending ? "Saving…" : contact ? "Save changes" : "Add contact"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  errors?: string[];
  placeholder?: string;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  errors,
  placeholder,
}: FieldProps) {
  const id = useId();
  const hasErrors = Boolean(errors?.length);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasErrors}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900"
      />
      {errors?.map((err) => (
        <p key={err} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {err}
        </p>
      ))}
    </div>
  );
}

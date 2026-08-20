"use client";

import { useId, useRef, useState, useTransition } from "react";
import { createContact, updateContact } from "@/app/actions";
import { CADENCE_PRESETS } from "@/lib/followup";
import type { Contact, ContactFormValues } from "@/types";

const emptyValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  favorite: false,
  tags: "",
  cadenceDays: "",
};

function toFormValues(contact: Contact): ContactFormValues {
  return {
    name: contact.name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
    favorite: contact.favorite,
    tags: contact.tags.map((t) => t.name).join(", "),
    cadenceDays: contact.cadenceDays ? String(contact.cadenceDays) : "",
  };
}

const inputClassName =
  "w-full rounded-xl border border-stone-300 bg-surface px-3.5 py-2.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-stone-700";

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
  const cadenceId = useId();
  const formRef = useRef<HTMLFormElement>(null);

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
        requestAnimationFrame(() => {
          formRef.current
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus();
        });
        return;
      }

      if (!contact) {
        setValues(emptyValues);
      }
      onDone?.();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      {formError && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
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
          autoComplete="name"
        />
        <Field
          label="Email"
          type="email"
          value={values.email}
          onChange={(v) => update("email", v)}
          errors={fieldErrors.email}
          autoComplete="email"
          spellCheck={false}
        />
        <Field
          label="Phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={(v) => update("phone", v)}
          errors={fieldErrors.phone}
          autoComplete="tel"
        />
        <Field
          label="Company"
          value={values.company}
          onChange={(v) => update("company", v)}
          errors={fieldErrors.company}
          autoComplete="organization"
        />
      </div>

      <Field
        label="Tags (comma-separated)"
        value={values.tags}
        onChange={(v) => update("tags", v)}
        errors={fieldErrors.tags}
        placeholder="friend, work, client…"
      />

      <div>
        <label
          htmlFor={cadenceId}
          className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Follow-up reminder
        </label>
        <select
          id={cadenceId}
          value={values.cadenceDays}
          onChange={(e) => update("cadenceDays", e.target.value)}
          aria-invalid={Boolean(fieldErrors.cadenceDays?.length)}
          className={inputClassName}
        >
          <option value="">No reminder</option>
          {CADENCE_PRESETS.map((preset) => (
            <option key={preset.days} value={preset.days}>
              {preset.label}
            </option>
          ))}
        </select>
        {fieldErrors.cadenceDays?.map((err) => (
          <p key={err} className="mt-1 text-xs text-red-600 dark:text-red-400">
            {err}
          </p>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
        <input
          type="checkbox"
          checked={values.favorite}
          onChange={(e) => update("favorite", e.target.checked)}
          className="h-4 w-4 rounded border-stone-300 text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        />
        Mark as favorite
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-stone-950"
        >
          {isPending ? "Saving…" : contact ? "Save Changes" : "Add Contact"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded text-sm text-stone-500 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-stone-400"
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
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
  errors?: string[];
  placeholder?: string;
  autoComplete?: string;
  spellCheck?: boolean;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  required,
  errors,
  placeholder,
  autoComplete,
  spellCheck,
}: FieldProps) {
  const id = useId();
  const hasErrors = Boolean(errors?.length);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasErrors}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        className={inputClassName}
      />
      {errors?.map((err) => (
        <p key={err} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {err}
        </p>
      ))}
    </div>
  );
}

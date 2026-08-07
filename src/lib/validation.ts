import { z } from "zod";
import { INTERACTION_CHANNELS } from "@/lib/channels";

function optionalText(maxLength: number, label: string) {
  return z
    .string()
    .trim()
    .max(maxLength, `${label} is too long`)
    .optional()
    .transform((v) => (v ? v : undefined));
}

const name = z.string().trim().min(1, "Name is required").max(120);

const email = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
    message: "Enter a valid email",
  });

const tags = z.array(z.string().trim().min(1).max(40, "Tag is too long"));

const cadenceDays = z
  .number()
  .int("Enter a whole number of days")
  .positive("Enter a whole number of days")
  .max(3650, "That's too far out — try 3650 days or fewer")
  .nullable();

export const contactInputSchema = z.object({
  name,
  email,
  phone: optionalText(40, "Phone"),
  company: optionalText(120, "Company"),
  favorite: z.boolean().default(false),
  tags: tags.default([]),
  cadenceDays: cadenceDays.default(null),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

// Unlike contactInputSchema, this schema must NOT apply defaults for
// omitted fields — a PATCH request that leaves a field out means "don't
// touch it", not "reset it to false/empty/null". cadenceDays: null (as
// opposed to the key being absent entirely) is how a caller explicitly
// clears an existing reminder cadence.
export const contactUpdateSchema = z
  .object({
    name,
    email,
    phone: optionalText(40, "Phone"),
    company: optionalText(120, "Company"),
    favorite: z.boolean(),
    tags,
    cadenceDays,
  })
  .partial();

export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;

export const interactionInputSchema = z.object({
  note: optionalText(2000, "Note"),
  channel: z.enum(INTERACTION_CHANNELS).optional(),
});

export type InteractionInput = z.infer<typeof interactionInputSchema>;

export const snoozeInputSchema = z.object({
  days: z.number().int().positive().max(365),
});

export type SnoozeInput = z.infer<typeof snoozeInputSchema>;

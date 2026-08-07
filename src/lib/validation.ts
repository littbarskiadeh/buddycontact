import { z } from "zod";

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

export const contactInputSchema = z.object({
  name,
  email,
  phone: optionalText(40, "Phone"),
  company: optionalText(120, "Company"),
  notes: optionalText(2000, "Notes"),
  favorite: z.boolean().default(false),
  tags: tags.default([]),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

// Unlike contactInputSchema, this schema must NOT apply defaults for
// omitted fields (favorite/tags) — a PATCH request that leaves a field
// out means "don't touch it", not "reset it to false/empty".
export const contactUpdateSchema = z
  .object({
    name,
    email,
    phone: optionalText(40, "Phone"),
    company: optionalText(120, "Company"),
    notes: optionalText(2000, "Notes"),
    favorite: z.boolean(),
    tags,
  })
  .partial();

export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { contactInputSchema, contactUpdateSchema } from "@/lib/validation";
import type { ContactFormValues } from "@/types";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function toContactInput(values: ContactFormValues) {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    company: values.company,
    notes: values.notes,
    favorite: values.favorite,
    tags: parseTags(values.tags),
  };
}

export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createContact(
  values: ContactFormValues,
): Promise<ActionResult> {
  const parsed = contactInputSchema.safeParse(toContactInput(values));

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { tags, ...data } = parsed.data;

  await prisma.contact.create({
    data: {
      ...data,
      tags: {
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateContact(
  id: string,
  values: ContactFormValues,
): Promise<ActionResult> {
  const parsed = contactUpdateSchema.safeParse(toContactInput(values));

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { tags, ...data } = parsed.data;

  await prisma.contact.update({
    where: { id },
    data: {
      ...data,
      ...(tags
        ? {
            tags: {
              set: [],
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }
        : {}),
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

export async function toggleFavorite(
  id: string,
  favorite: boolean,
): Promise<ActionResult> {
  await prisma.contact.update({ where: { id }, data: { favorite } });
  revalidatePath("/");
  return { success: true };
}

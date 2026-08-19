"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  contactInputSchema,
  contactUpdateSchema,
  interactionInputSchema,
  snoozeInputSchema,
} from "@/lib/validation";
import type { InteractionChannel } from "@/lib/channels";
import type { ContactFormValues } from "@/types";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseCadenceDays(raw: string): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function toContactInput(values: ContactFormValues) {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    company: values.company,
    favorite: values.favorite,
    tags: parseTags(values.tags),
    cadenceDays: parseCadenceDays(values.cadenceDays),
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
  revalidatePath(`/contacts/${id}`);
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
  revalidatePath(`/contacts/${id}`);
  return { success: true };
}

export async function logInteraction(
  contactId: string,
  note?: string,
  channel?: InteractionChannel,
): Promise<ActionResult> {
  const parsed = interactionInputSchema.safeParse({ note, channel });

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

  const occurredAt = new Date();

  await prisma.$transaction([
    prisma.interaction.create({
      data: {
        contactId,
        note: parsed.data.note,
        channel: parsed.data.channel,
        occurredAt,
      },
    }),
    // Reaching out supersedes any earlier "not now" — clear the snooze so
    // the contact doesn't keep showing as snoozed after you've just talked.
    // Also clear the cached AI conversation-starter: it was grounded in the
    // history as of before this interaction, so it's stale now.
    prisma.contact.update({
      where: { id: contactId },
      data: {
        lastContactedAt: occurredAt,
        snoozedUntil: null,
        suggestedTopic: null,
        suggestedTopicAt: null,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/contacts/${contactId}`);
  return { success: true };
}

export async function snoozeContact(
  contactId: string,
  days: number,
): Promise<ActionResult> {
  const parsed = snoozeInputSchema.safeParse({ days });

  if (!parsed.success) {
    return { success: false, error: "Invalid snooze duration." };
  }

  const snoozedUntil = new Date(
    Date.now() + parsed.data.days * 24 * 60 * 60 * 1000,
  );

  await prisma.contact.update({
    where: { id: contactId },
    data: { snoozedUntil },
  });

  revalidatePath("/");
  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/triage");
  return { success: true };
}

export async function unsnoozeContact(
  contactId: string,
): Promise<ActionResult> {
  await prisma.contact.update({
    where: { id: contactId },
    data: { snoozedUntil: null },
  });

  revalidatePath("/");
  revalidatePath(`/contacts/${contactId}`);
  return { success: true };
}

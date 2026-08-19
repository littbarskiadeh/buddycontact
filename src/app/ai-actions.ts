"use server";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CHANNEL_LABELS } from "@/lib/channels";
import { formatRelativeTime } from "@/lib/followup";

const SUGGESTIONS_MODEL = "claude-opus-5";

const suggestionsSchema = z.object({
  topics: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe(
      "2-3 short, concrete, specific conversation topics or follow-up questions, grounded in the interaction history provided. Each under 15 words.",
    ),
});

export type TopicSuggestionsResult =
  { success: true; topics: string[] } | { success: false; error: string };

const bubbleSchema = z.object({
  topic: z
    .string()
    .describe(
      "One short, concrete conversation-starter grounded in the interaction history, under 8 words — punchy enough to fit in a small chat-bubble UI element, not a full sentence.",
    ),
});

export type TopicBubbleResult =
  { success: true; topic: string } | { success: false; error: string };

/**
 * Read-through cache: returns Contact.suggestedTopic if already generated,
 * otherwise generates one short conversation-starter and caches it — so a
 * contact list of N cards costs at most N Claude calls total (once, ever),
 * not N calls per page load.
 */
export async function getTopicBubble(
  contactId: string,
): Promise<TopicBubbleResult> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { interactions: { orderBy: { occurredAt: "desc" }, take: 5 } },
  });

  if (!contact) {
    return { success: false, error: "Contact not found." };
  }

  if (contact.suggestedTopic) {
    return { success: true, topic: contact.suggestedTopic };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: "No API key configured." };
  }

  const historyLines =
    contact.interactions.length > 0
      ? contact.interactions.map((interaction) => {
          const when = formatRelativeTime(interaction.occurredAt);
          const via = interaction.channel
            ? ` via ${CHANNEL_LABELS[interaction.channel as keyof typeof CHANNEL_LABELS] ?? interaction.channel}`
            : "";
          const note = interaction.note ? `: ${interaction.note}` : "";
          return `- ${when}${via}${note}`;
        })
      : ["- No interactions logged yet."];

  const userPrompt = [
    `Contact: ${contact.name}`,
    contact.company ? `Company: ${contact.company}` : null,
    "",
    "Recent interaction history (most recent first):",
    ...historyLines,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: SUGGESTIONS_MODEL,
      max_tokens: 256,
      output_config: {
        effort: "low",
        format: zodOutputFormat(bubbleSchema),
      },
      system:
        "You help someone stay in touch with people in their life. Given a " +
        "contact's recent interaction history, write ONE short conversation " +
        "starter for their next chat — under 8 words, punchy, grounded in " +
        "something specific from the history (a mentioned job, event, or " +
        "plan), never generic small talk. If there's no history, suggest a " +
        "natural way to start getting to know them.",
      messages: [{ role: "user", content: userPrompt }],
    });

    if (!response.parsed_output) {
      return { success: false, error: "Couldn't generate a suggestion." };
    }

    const topic = response.parsed_output.topic;

    await prisma.contact.update({
      where: { id: contactId },
      data: { suggestedTopic: topic, suggestedTopicAt: new Date() },
    });
    revalidatePath("/");

    return { success: true, topic };
  } catch (error) {
    console.error("getTopicBubble failed", error);
    return { success: false, error: "AI suggestions are unavailable." };
  }
}

export async function getTopicSuggestions(
  contactId: string,
): Promise<TopicSuggestionsResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error:
        "AI suggestions need an ANTHROPIC_API_KEY set in your environment.",
    };
  }

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      tags: true,
      interactions: { orderBy: { occurredAt: "desc" }, take: 5 },
    },
  });

  if (!contact) {
    return { success: false, error: "Contact not found." };
  }

  const historyLines =
    contact.interactions.length > 0
      ? contact.interactions.map((interaction) => {
          const when = formatRelativeTime(interaction.occurredAt);
          const via = interaction.channel
            ? ` via ${CHANNEL_LABELS[interaction.channel as keyof typeof CHANNEL_LABELS] ?? interaction.channel}`
            : "";
          const note = interaction.note ? `: ${interaction.note}` : "";
          return `- ${when}${via}${note}`;
        })
      : ["- No interactions logged yet."];

  const userPrompt = [
    `Contact: ${contact.name}`,
    contact.company ? `Company: ${contact.company}` : null,
    contact.tags.length > 0
      ? `Tags: ${contact.tags.map((t) => t.name).join(", ")}`
      : null,
    "",
    "Recent interaction history (most recent first):",
    ...historyLines,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: SUGGESTIONS_MODEL,
      max_tokens: 512,
      output_config: {
        effort: "low",
        format: zodOutputFormat(suggestionsSchema),
      },
      system:
        "You help someone stay in touch with people in their life. Given a " +
        "contact's recent interaction history, suggest 2-3 short, specific " +
        "conversation topics or follow-up questions for their next chat. " +
        "Ground every suggestion in something from the history — a mentioned " +
        "job, event, or plan — never generic small talk. If there's no " +
        "history, suggest natural ways to start getting to know them. Keep " +
        "each suggestion under 15 words.",
      messages: [{ role: "user", content: userPrompt }],
    });

    if (!response.parsed_output) {
      return {
        success: false,
        error: "Couldn't generate suggestions — try again.",
      };
    }

    return { success: true, topics: response.parsed_output.topics };
  } catch (error) {
    console.error("getTopicSuggestions failed", error);
    return {
      success: false,
      error: "AI suggestions are temporarily unavailable.",
    };
  }
}

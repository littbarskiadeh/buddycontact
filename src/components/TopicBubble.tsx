"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getTopicBubble } from "@/app/ai-actions";

type TopicBubbleProps = {
  contactId: string;
  initialTopic: string | null;
};

/**
 * Fails silently (renders nothing) on error — this is a decorative,
 * ambient suggestion, not a critical control, and most failures just mean
 * no ANTHROPIC_API_KEY is configured. LogInteractionForm/TopicSuggestions
 * already surface that error explicitly where it matters (the detail page).
 */
export function TopicBubble({ contactId, initialTopic }: TopicBubbleProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (topic || failed) return;
    let cancelled = false;

    getTopicBubble(contactId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setTopic(result.topic);
      } else {
        setFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [contactId, topic, failed]);

  if (!topic) return null;

  return (
    <p className="mt-1 flex items-start gap-1.5 text-sm text-violet-700 dark:text-violet-300">
      <MessageCircle
        className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-violet-100 dark:fill-violet-950"
        aria-hidden="true"
      />
      <span className="truncate italic">{topic}</span>
    </p>
  );
}

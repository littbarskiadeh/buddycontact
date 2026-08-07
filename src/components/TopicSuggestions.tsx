"use client";

import { useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import { getTopicSuggestions } from "@/app/ai-actions";

type TopicSuggestionsProps = {
  contactId: string;
  contactName: string;
};

export function TopicSuggestions({
  contactId,
  contactName,
}: TopicSuggestionsProps) {
  const [topics, setTopics] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await getTopicSuggestions(contactId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTopics(result.topics);
    });
  }

  if (!topics && !isPending && !error) {
    return (
      <button
        type="button"
        onClick={handleGenerate}
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-sm text-stone-500 transition-colors hover:border-orange-400 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-700 dark:text-stone-400 dark:hover:text-orange-400"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Suggest what to talk about with {contactName}
      </button>
    );
  }

  return (
    <div className="animate-fade-in-up rounded-2xl border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-900 dark:bg-orange-950/20">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-orange-900 dark:text-orange-200">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Suggested topics
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss suggestions"
          className="rounded p-0.5 text-orange-700 hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-orange-300 dark:hover:bg-orange-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {isPending && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-orange-800 dark:text-orange-300"
        >
          Thinking…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="text-sm text-orange-800 dark:text-orange-300"
        >
          {error}
        </p>
      )}

      {topics && (
        <ul className="space-y-1.5 text-sm text-orange-900 dark:text-orange-200">
          {topics.map((topic) => (
            <li key={topic} className="flex gap-2">
              <span aria-hidden="true">•</span>
              {topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

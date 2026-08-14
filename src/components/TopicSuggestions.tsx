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
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-violet-300 bg-violet-50/50 px-3.5 py-2 text-sm font-medium text-violet-700 transition-colors hover:border-violet-400 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-950/60"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Suggest what to talk about with {contactName}
      </button>
    );
  }

  return (
    <div className="animate-fade-in-up rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50/40 p-4 dark:border-violet-900 dark:from-violet-950/30 dark:to-fuchsia-950/10">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-violet-900 dark:text-violet-200">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Suggested topics
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss suggestions"
          className="rounded p-0.5 text-violet-700 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300 dark:hover:bg-violet-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {isPending && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-violet-800 dark:text-violet-300"
        >
          Thinking…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="text-sm text-violet-800 dark:text-violet-300"
        >
          {error}
        </p>
      )}

      {topics && (
        <ul className="space-y-1.5 text-sm text-violet-900 dark:text-violet-200">
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

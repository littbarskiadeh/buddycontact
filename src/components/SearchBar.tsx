"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { Tag } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;

const controlClassName =
  "rounded-full border border-stone-300 bg-surface px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-stone-700";

export function SearchBar({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when the URL changes from elsewhere (browser
  // back/forward, or the tag filter), not just from typing in this box.
  // Adjusting state during render (rather than in an effect) avoids an
  // extra render pass — see https://react.dev/learn/you-might-not-need-an-effect
  const searchParamsKey = searchParams.toString();
  const [prevSearchParamsKey, setPrevSearchParamsKey] =
    useState(searchParamsKey);
  if (searchParamsKey !== prevSearchParamsKey) {
    setPrevSearchParamsKey(searchParamsKey);
    setQuery(searchParams.get("q") ?? "");
  }

  function pushParam(key: "q" | "tag", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => pushParam("q", value),
      SEARCH_DEBOUNCE_MS,
    );
  }

  const activeTag = searchParams.get("tag") ?? "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={query}
        aria-label="Search contacts"
        placeholder="Search by name, email, or company…"
        onChange={(e) => handleQueryChange(e.target.value)}
        className={`w-full sm:max-w-sm ${controlClassName}`}
      />

      <select
        value={activeTag}
        aria-label="Filter by tag"
        onChange={(e) => pushParam("tag", e.target.value)}
        className={controlClassName}
      >
        <option value="">All tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.name}>
            {tag.name}
          </option>
        ))}
      </select>

      <span aria-live="polite" className="text-xs text-stone-400">
        {isPending ? "Searching…" : ""}
      </span>
    </div>
  );
}

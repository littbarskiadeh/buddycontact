"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
import type { Tag } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;

const controlClassName =
  "rounded-full border border-stone-300 bg-surface py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-stone-700";

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
      <div className="relative w-full sm:max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          aria-label="Search contacts"
          placeholder="Search by name, email, or company…"
          onChange={(e) => handleQueryChange(e.target.value)}
          className={`w-full pr-4 pl-10 ${controlClassName}`}
        />
      </div>

      <select
        value={activeTag}
        aria-label="Filter by tag"
        onChange={(e) => pushParam("tag", e.target.value)}
        className={`px-4 ${controlClassName}`}
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

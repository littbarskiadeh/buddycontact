"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import type { Tag } from "@/types";

export function SearchBar({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  function pushParams(next: { q?: string; tag?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const q = next.q ?? searchParams.get("q") ?? "";
    const tag = next.tag ?? searchParams.get("tag") ?? "";

    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }

    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  const activeTag = searchParams.get("tag") ?? "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={query}
        placeholder="Search by name, email, or company…"
        onChange={(e) => {
          setQuery(e.target.value);
          pushParams({ q: e.target.value });
        }}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:max-w-sm dark:border-slate-700 dark:bg-slate-900"
      />

      <select
        value={activeTag}
        onChange={(e) => pushParams({ tag: e.target.value })}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900"
      >
        <option value="">All tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.name}>
            {tag.name}
          </option>
        ))}
      </select>

      {isPending && <span className="text-xs text-slate-400">Searching…</span>}
    </div>
  );
}

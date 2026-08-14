"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, MessageCircleHeart, Users } from "lucide-react";

const links = [
  { href: "/", label: "Contacts", icon: Users, exact: true },
  { href: "/triage", label: "Triage", icon: ListChecks, exact: false },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-surface/80 backdrop-blur-md dark:border-stone-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded font-display text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 text-white shadow-sm">
            <MessageCircleHeart className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          BuddyContact
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:px-4 ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

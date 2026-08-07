import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AddContactPanel } from "@/components/AddContactPanel";
import { ContactList } from "@/components/ContactList";
import { SearchBar } from "@/components/SearchBar";

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { q, tag } = await searchParams;

  const [contacts, tags] = await Promise.all([
    prisma.contact.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q } },
                  { email: { contains: q } },
                  { company: { contains: q } },
                ],
              }
            : {},
          tag ? { tags: { some: { name: tag } } } : {},
        ],
      },
      include: { tags: true },
      orderBy: [{ favorite: "desc" }, { name: "asc" }],
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            BuddyContact
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your personal contact book.
          </p>
        </div>
        <AddContactPanel />
      </header>

      <div className="mb-6">
        <Suspense>
          <SearchBar tags={tags} />
        </Suspense>
      </div>

      <ContactList
        contacts={contacts.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY_MS);

async function main() {
  await prisma.interaction.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.tag.deleteMany();

  // Overdue: reminder every 14 days, last contacted 30 days ago.
  const ada = await prisma.contact.create({
    data: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
      company: "Analytical Engines Ltd",
      favorite: true,
      cadenceDays: 14,
      lastContactedAt: daysAgo(30),
      tags: {
        connectOrCreate: [
          { where: { name: "mentor" }, create: { name: "mentor" } },
          { where: { name: "tech" }, create: { name: "tech" } },
        ],
      },
    },
  });
  await prisma.interaction.createMany({
    data: [
      {
        contactId: ada.id,
        channel: "call",
        note: "Caught up about the new analytical engine prototype.",
        occurredAt: daysAgo(30),
      },
      {
        contactId: ada.id,
        channel: "email",
        note: "Quick note to wish her well before her trip.",
        occurredAt: daysAgo(75),
      },
    ],
  });

  // Due soon: reminder every 30 days, last contacted 28 days ago.
  const grace = await prisma.contact.create({
    data: {
      name: "Grace Hopper",
      email: "grace@example.com",
      phone: "555-0101",
      company: "US Navy",
      cadenceDays: 30,
      lastContactedAt: daysAgo(28),
      tags: {
        connectOrCreate: [
          { where: { name: "mentor" }, create: { name: "mentor" } },
          { where: { name: "navy" }, create: { name: "navy" } },
        ],
      },
    },
  });
  await prisma.interaction.create({
    data: {
      contactId: grace.id,
      channel: "text",
      note: "Debugged a tricky compiler issue together.",
      occurredAt: daysAgo(28),
    },
  });

  // On track: reminder every 90 days, contacted recently (within this week).
  const alan = await prisma.contact.create({
    data: {
      name: "Alan Turing",
      email: "alan@example.com",
      company: "Bletchley Park",
      cadenceDays: 90,
      lastContactedAt: daysAgo(5),
      tags: {
        connectOrCreate: [
          { where: { name: "tech" }, create: { name: "tech" } },
        ],
      },
    },
  });
  await prisma.interaction.create({
    data: {
      contactId: alan.id,
      channel: "call",
      note: "Talked through the new machine design.",
      occurredAt: daysAgo(5),
    },
  });

  // Snoozed: would be overdue at this cadence, but explicitly deferred.
  await prisma.contact.create({
    data: {
      name: "Marie Curie",
      email: "marie@example.com",
      company: "Sorbonne",
      cadenceDays: 14,
      lastContactedAt: daysAgo(20),
      snoozedUntil: daysFromNow(5),
      tags: {
        connectOrCreate: [
          { where: { name: "mentor" }, create: { name: "mentor" } },
          { where: { name: "tech" }, create: { name: "tech" } },
        ],
      },
      interactions: {
        create: {
          channel: "email",
          note: "She's mid-experiment — asked to check back next month.",
          occurredAt: daysAgo(20),
        },
      },
    },
  });

  // No reminder set, but with a multi-week interaction history — populates
  // the weekly recap / streak without affecting any due-status calculation.
  const katherine = await prisma.contact.create({
    data: {
      name: "Katherine Johnson",
      email: "katherine@example.com",
      company: "NASA",
      lastContactedAt: daysAgo(2),
      tags: {
        connectOrCreate: [
          { where: { name: "mentor" }, create: { name: "mentor" } },
        ],
      },
    },
  });
  await prisma.interaction.createMany({
    data: [
      {
        contactId: katherine.id,
        channel: "chat",
        note: "Caught up about her new orbital mechanics project.",
        occurredAt: daysAgo(2),
      },
      {
        contactId: katherine.id,
        channel: "email",
        note: "Sent her an article she'd like.",
        occurredAt: daysAgo(10),
      },
      {
        contactId: katherine.id,
        channel: "social",
        note: "Liked and commented on her post.",
        occurredAt: daysAgo(17),
      },
    ],
  });

  console.log("Seeded 5 contacts with follow-up history.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

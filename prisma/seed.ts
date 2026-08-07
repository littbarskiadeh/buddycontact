import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.contact.deleteMany();
  await prisma.tag.deleteMany();

  await prisma.contact.create({
    data: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
      company: "Analytical Engines Ltd",
      notes: "First to publish an algorithm intended for a machine.",
      favorite: true,
      tags: {
        connectOrCreate: [
          { where: { name: "mentor" }, create: { name: "mentor" } },
          { where: { name: "tech" }, create: { name: "tech" } },
        ],
      },
    },
  });

  await prisma.contact.create({
    data: {
      name: "Grace Hopper",
      email: "grace@example.com",
      phone: "555-0101",
      company: "US Navy",
      tags: {
        connectOrCreate: [
          { where: { name: "mentor" }, create: { name: "mentor" } },
          { where: { name: "navy" }, create: { name: "navy" } },
        ],
      },
    },
  });

  await prisma.contact.create({
    data: {
      name: "Alan Turing",
      email: "alan@example.com",
      company: "Bletchley Park",
      tags: {
        connectOrCreate: [
          { where: { name: "tech" }, create: { name: "tech" } },
        ],
      },
    },
  });

  console.log("Seeded 3 contacts.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

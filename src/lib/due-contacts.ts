import { prisma } from "@/lib/prisma";
import { compareFollowUpUrgency, getFollowUpInfo } from "@/lib/followup";

export async function getDueContacts() {
  const contacts = await prisma.contact.findMany({
    include: { tags: true },
    orderBy: [{ favorite: "desc" }, { name: "asc" }],
  });

  return contacts
    .map((contact) => ({
      contact,
      followUp: getFollowUpInfo({
        cadenceDays: contact.cadenceDays,
        lastContactedAt: contact.lastContactedAt,
        createdAt: contact.createdAt,
        snoozedUntil: contact.snoozedUntil,
      }),
    }))
    .filter(
      ({ followUp }) =>
        followUp.status === "overdue" || followUp.status === "due-soon",
    )
    .sort((a, b) => compareFollowUpUrgency(a.followUp, b.followUp));
}

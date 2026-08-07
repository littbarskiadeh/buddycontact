import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactInputSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const tag = searchParams.get("tag")?.trim();

  const contacts = await prisma.contact.findMany({
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
  });

  return NextResponse.json(contacts);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = contactInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid contact data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { tags, ...data } = parsed.data;

  const contact = await prisma.contact.create({
    data: {
      ...data,
      tags: {
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  });

  return NextResponse.json(contact, { status: 201 });
}

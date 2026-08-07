import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { interactionInputSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const interactions = await prisma.interaction.findMany({
    where: { contactId: id },
    orderBy: { occurredAt: "desc" },
  });

  return NextResponse.json(interactions);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = interactionInputSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid interaction data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const occurredAt = new Date();

  const [interaction] = await prisma.$transaction([
    prisma.interaction.create({
      data: { contactId: id, note: parsed.data.note, occurredAt },
    }),
    prisma.contact.update({
      where: { id },
      data: { lastContactedAt: occurredAt },
    }),
  ]);

  return NextResponse.json(interaction, { status: 201 });
}

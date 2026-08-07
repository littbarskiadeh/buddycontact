import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactUpdateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = contactUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid contact data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const { tags, ...data } = parsed.data;

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...data,
      ...(tags
        ? {
            tags: {
              set: [],
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }
        : {}),
    },
    include: { tags: true },
  });

  return NextResponse.json(contact);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  await prisma.contact.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

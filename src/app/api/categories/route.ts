import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { services: { where: { status: "ACTIVE" } } } },
      },
    });

    return NextResponse.json(
      categories.map((c) => ({
        id:           c.id,
        name:         c.name,
        slug:         c.slug,
        icon:         c.icon,
        color:        c.color,
        serviceCount: c._count.services,
      }))
    );
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

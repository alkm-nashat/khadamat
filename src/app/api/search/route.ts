import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json({ services: [], categories: [] });
  }

  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title:       { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 5,
      select: {
        id: true, title: true,
        category: { select: { icon: true, name: true, color: true } },
        city: { select: { name: true } },
        images: { take: 1, select: { url: true }, orderBy: { order: "asc" } },
      },
    }),
    prisma.serviceCategory.findMany({
      where: {
        isActive: true,
        name: { contains: q },
      },
      take: 3,
      select: { id: true, name: true, slug: true, icon: true, color: true },
    }),
  ]);

  return NextResponse.json({ services, categories });
}

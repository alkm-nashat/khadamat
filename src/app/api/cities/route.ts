import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const regionId = req.nextUrl.searchParams.get("regionId");

  if (!regionId) {
    return NextResponse.json({ error: "regionId مطلوب" }, { status: 400 });
  }

  try {
    const cities = await prisma.city.findMany({
      where: { regionId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json(cities);
  } catch (err) {
    console.error("GET /api/cities:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

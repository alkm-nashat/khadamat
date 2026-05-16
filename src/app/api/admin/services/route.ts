import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const q      = req.nextUrl.searchParams.get("q")      || "";
  const status = req.nextUrl.searchParams.get("status") || "";
  const page   = Math.max(1, Number(req.nextUrl.searchParams.get("page") || 1));
  const limit  = 20;

  try {
    const where = {
      ...(status && { status }),
      ...(q && {
        OR: [
          { title:       { contains: q } },
          { description: { contains: q } },
        ],
      }),
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          category: { select: { name: true, icon: true, color: true } },
          provider: { select: { id: true, name: true, username: true } },
          city:     { select: { name: true } },
          images:   { take: 1, orderBy: { order: "asc" } },
          _count:   { select: { bookings: true } },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({ services, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET /api/admin/services:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

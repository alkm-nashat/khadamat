import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const q    = req.nextUrl.searchParams.get("q")    || "";
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || 1));
  const limit = 20;

  try {
    const where = q ? {
      OR: [
        { name:     { contains: q } },
        { username: { contains: q } },
        { phone:    { contains: q } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:  (page - 1) * limit,
        take:  limit,
        select: {
          id: true, name: true, username: true, phone: true,
          role: true, isBlocked: true, isVerified: true,
          rating: true, totalRatings: true, createdAt: true,
          _count: { select: { services: true, bookingsAsClient: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET /api/admin/users:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

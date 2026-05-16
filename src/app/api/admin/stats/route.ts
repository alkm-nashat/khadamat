import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const [
      totalUsers,
      activeServices,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRatings,
      recentUsers,
      recentServices,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.service.count({ where: { status: "ACTIVE" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.rating.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" }, take: 5,
        select: { id: true, name: true, username: true, phone: true, role: true, createdAt: true },
      }),
      prisma.service.findMany({
        orderBy: { createdAt: "desc" }, take: 5,
        include: {
          category: { select: { name: true, icon: true } },
          provider: { select: { name: true, username: true } },
          images:   { take: 1, orderBy: { order: "asc" } },
        },
      }),
    ]);

    const revenue = completedBookings * 10; // 10 SAR per completed booking

    return NextResponse.json({
      totalUsers, activeServices, totalBookings,
      completedBookings, pendingBookings, totalRatings, revenue,
      recentUsers, recentServices,
    });
  } catch (err) {
    console.error("GET /api/admin/stats:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

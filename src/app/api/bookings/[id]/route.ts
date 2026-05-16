import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// ─── GET /api/bookings/[id] ───────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            category: true,
            provider: { select: { id: true, name: true, avatar: true, username: true, rating: true, phone: true } },
            images:   { orderBy: { order: "asc" } },
            city:     true,
            region:   true,
          },
        },
        client: { select: { id: true, name: true, avatar: true, username: true, phone: true } },
        rating: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });
    }

    // Only client or provider can view
    const isClient   = booking.clientId              === session.user.id;
    const isProvider = booking.service.providerId    === session.user.id;
    const isAdmin    = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isClient && !isProvider && !isAdmin) {
      return NextResponse.json({ error: "لا تملك صلاحية الوصول" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (err) {
    console.error("GET /api/bookings/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// ─── PUT /api/bookings/[id] — update status ───────────────────────────────────
// Provider: PENDING→CONFIRMED, PENDING/CONFIRMED→CANCELLED
// Client:   PENDING→CANCELLED
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: { select: { providerId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });
    }

    const isClient   = booking.clientId           === session.user.id;
    const isProvider = booking.service.providerId === session.user.id;
    const isAdmin    = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isClient && !isProvider && !isAdmin) {
      return NextResponse.json({ error: "لا تملك صلاحية التعديل" }, { status: 403 });
    }

    const { action } = await req.json() as { action: string };

    // ── Provider actions ──────────────────────────────────────────────────────
    if ((isProvider || isAdmin) && action === "confirm") {
      if (booking.status !== "PENDING") {
        return NextResponse.json({ error: "يمكن تأكيد الحجوزات المعلقة فقط" }, { status: 400 });
      }
      const updated = await prisma.booking.update({
        where: { id },
        data:  { status: "CONFIRMED" },
      });
      return NextResponse.json(updated);
    }

    // ── Client or Provider: cancel ────────────────────────────────────────────
    if (action === "cancel") {
      if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
        return NextResponse.json({ error: "لا يمكن إلغاء هذا الحجز" }, { status: 400 });
      }
      // Client can only cancel their own PENDING bookings
      if (isClient && !isProvider && !isAdmin && booking.status === "CONFIRMED") {
        return NextResponse.json({ error: "تواصل مع مقدم الخدمة لإلغاء حجز مؤكد" }, { status: 400 });
      }
      const updated = await prisma.booking.update({
        where: { id },
        data:  { status: "CANCELLED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/bookings/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// ─── GET /api/bookings?role=client|provider ───────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = req.nextUrl.searchParams.get("role") ?? "client";
  const userId = session.user.id;

  try {
    const bookings = await prisma.booking.findMany({
      where: role === "provider"
        ? { service: { providerId: userId } }
        : { clientId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          include: {
            category: { select: { id: true, name: true, icon: true, color: true } },
            images:   { orderBy: { order: "asc" }, take: 1 },
            provider: { select: { id: true, name: true, avatar: true, username: true } },
            city:     { select: { id: true, name: true } },
          },
        },
        client: { select: { id: true, name: true, avatar: true, username: true } },
        rating: { select: { id: true, score: true } },
      },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("GET /api/bookings:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// ─── POST /api/bookings ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
  }

  try {
    const { serviceId, notes } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: "معرّف الخدمة مطلوب" }, { status: 400 });
    }

    // Verify service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, providerId: true, status: true },
    });

    if (!service || service.status !== "ACTIVE") {
      return NextResponse.json({ error: "الخدمة غير متاحة" }, { status: 404 });
    }

    // Can't book your own service
    if (service.providerId === session.user.id) {
      return NextResponse.json({ error: "لا يمكنك حجز خدمتك الخاصة" }, { status: 400 });
    }

    // Check for an existing pending/confirmed booking
    const existing = await prisma.booking.findFirst({
      where: {
        serviceId,
        clientId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "لديك حجز نشط مسبقاً لهذه الخدمة", bookingId: existing.id },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        clientId: session.user.id,
        notes:    notes?.trim() || null,
        status:   "PENDING",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

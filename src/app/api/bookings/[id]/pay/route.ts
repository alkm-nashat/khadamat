import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/bookings/[id]/pay
// الدفع المحاكي (10 ريال) — يفتح التقييم
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true, clientId: true, status: true,
        paymentStatus: true, canRate: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });
    }

    // Only client can pay
    if (booking.clientId !== session.user.id) {
      return NextResponse.json({ error: "لا تملك صلاحية الدفع" }, { status: 403 });
    }

    if (booking.paymentStatus === "PAID") {
      return NextResponse.json({ error: "تم الدفع مسبقاً" }, { status: 400 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "لا يمكن الدفع لحجز ملغى" }, { status: 400 });
    }

    // Mark as paid, complete the booking, and unlock rating
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        status:        "COMPLETED",
        canRate:       true,
        paymentRef:    `SIM-${Date.now()}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/bookings/[id]/pay:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

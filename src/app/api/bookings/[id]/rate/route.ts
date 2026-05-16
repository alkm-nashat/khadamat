import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const rateSchema = z.object({
  score:   z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// POST /api/bookings/[id]/rate
export async function POST(
  req: NextRequest,
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
      include: {
        service: { select: { id: true, providerId: true } },
        rating:  { select: { id: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });
    }

    if (booking.clientId !== session.user.id) {
      return NextResponse.json({ error: "فقط العميل يمكنه تقييم الخدمة" }, { status: 403 });
    }

    if (!booking.canRate) {
      return NextResponse.json({ error: "يجب إتمام الدفع أولاً لفتح التقييم" }, { status: 400 });
    }

    if (booking.rating) {
      return NextResponse.json({ error: "لقد قيّمت هذه الخدمة مسبقاً" }, { status: 400 });
    }

    const parsed = rateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { score, comment } = parsed.data;
    const providerId = booking.service.providerId;

    // Create rating
    await prisma.rating.create({
      data: {
        score,
        comment:   comment?.trim() || null,
        bookingId: id,
        raterId:   session.user.id,
        providerId,
        serviceId: booking.service.id,
      },
    });

    // Close rating window on booking
    await prisma.booking.update({
      where: { id },
      data:  { canRate: false },
    });

    // Recalculate provider's average rating
    const agg = await prisma.rating.aggregate({
      where:   { providerId },
      _avg:    { score: true },
      _count:  { score: true },
    });

    await prisma.user.update({
      where: { id: providerId },
      data: {
        rating:      agg._avg.score ?? 0,
        totalRatings: agg._count.score,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/bookings/[id]/rate:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

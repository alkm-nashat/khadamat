import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name:   z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(60).optional(),
  bio:    z.string().max(300).optional().nullable(),
  city:   z.string().max(60).optional().nullable(),
  email:  z.string().email("بريد إلكتروني غير صحيح").optional().nullable().or(z.literal("")),
  avatar: z.string().url().optional().nullable(),
});

// ─── GET /api/profile — current user ─────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, username: true, phone: true,
        email: true, avatar: true, bio: true, city: true,
        role: true, rating: true, totalRatings: true, createdAt: true,
        _count: {
          select: {
            services:         { where: { status: "ACTIVE" } },
            bookingsAsClient: true,
            ratingsReceived:  true,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    console.error("GET /api/profile:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// ─── PUT /api/profile — update current user ───────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If email is changing, ensure it's not taken
    if (data.email) {
      const taken = await prisma.user.findFirst({
        where: { email: data.email, id: { not: session.user.id } },
      });
      if (taken) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم مسبقاً" }, { status: 409 });
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name   !== undefined && { name:   data.name }),
        ...(data.bio    !== undefined && { bio:    data.bio }),
        ...(data.city   !== undefined && { city:   data.city }),
        ...(data.email  !== undefined && { email:  data.email || null }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
      select: {
        id: true, name: true, username: true, phone: true,
        email: true, avatar: true, bio: true, city: true,
        role: true, rating: true, totalRatings: true,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("PUT /api/profile:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

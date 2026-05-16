import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title:         z.string().min(5).max(100).optional(),
  description:   z.string().min(20).max(2000).optional(),
  suggestedNote: z.string().max(500).optional().nullable(),
  deliveryTime:  z.string().max(100).optional().nullable(),
  categoryId:    z.string().optional(),
  regionId:      z.string().optional(),
  cityId:        z.string().optional(),
  tags:          z.array(z.string()).max(10).optional(),
  status:        z.enum(["ACTIVE", "HIDDEN"]).optional(),
  images: z.array(z.object({
    url:      z.string(),
    publicId: z.string(),
    width:    z.number().default(800),
    height:   z.number().default(600),
    sizeKb:   z.number().default(0),
  })).max(3).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        provider: {
          select: {
            id: true, name: true, avatar: true, bio: true,
            rating: true, totalRatings: true, username: true,
            city: true, createdAt: true,
            _count: { select: { services: { where: { status: "ACTIVE" } } } },
          },
        },
        region: true, city: true,
        images: { orderBy: { order: "asc" } },
        ratings: {
          orderBy: { createdAt: "desc" }, take: 5,
          include: { rater: { select: { id: true, name: true, avatar: true, username: true } } },
        },
        _count: { select: { bookings: true } },
      },
    });

    if (!service || service.status !== "ACTIVE") {
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }

    await prisma.service.update({ where: { id }, data: { views: { increment: 1 } } });
    return NextResponse.json(service);
  } catch (err) {
    console.error("GET /api/services/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (existing.providerId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "لا تملك صلاحية التعديل" }, { status: 403 });
    }

    const body   = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { images, tags, ...rest } = parsed.data;

    if (images !== undefined) {
      await prisma.serviceImage.deleteMany({ where: { serviceId: id } });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...rest,
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(images !== undefined && {
          images: {
            create: images.map((img, i) => ({
              url: img.url, publicId: img.publicId,
              width: img.width, height: img.height, sizeKb: img.sizeKb, order: i,
            })),
          },
        }),
      },
      include: { images: true, category: true, region: true, city: true },
    });

    return NextResponse.json(service);
  } catch (err) {
    console.error("PUT /api/services/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (existing.providerId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "لا تملك صلاحية الحذف" }, { status: 403 });
    }

    await prisma.service.update({ where: { id }, data: { status: "HIDDEN" } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/services/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

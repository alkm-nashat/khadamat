import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title:         z.string().min(5,  "العنوان يجب أن يكون 5 أحرف على الأقل").max(100),
  description:   z.string().min(20, "الوصف يجب أن يكون 20 حرفاً على الأقل").max(2000),
  suggestedNote: z.string().max(500).optional(),
  deliveryTime:  z.string().max(100).optional(),
  categoryId:    z.string().min(1, "اختر التصنيف"),
  regionId:      z.string().min(1, "اختر المنطقة"),
  cityId:        z.string().min(1, "اختر المدينة"),
  tags:          z.array(z.string()).max(10).optional().default([]),
  images: z.array(z.object({
    url:      z.string(),
    publicId: z.string(),
    width:    z.number().default(800),
    height:   z.number().default(600),
    sizeKb:   z.number().default(0),
  })).max(3).optional().default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  || 1));
    const limit    = Math.min(24, Number(searchParams.get("limit") || 12));
    const category = searchParams.get("category") || undefined;
    const region   = searchParams.get("region")   || undefined;
    const search   = searchParams.get("q")        || undefined;
    const sort     = searchParams.get("sort")      || "latest";

    const where = {
      status: "ACTIVE",
      ...(category && { category: { slug: category } }),
      ...(region   && { region:   { slug: region }   }),
      ...(search && {
        OR: [
          { title:       { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const orderBy =
      sort === "views"  ? { views: "desc" as const } :
      sort === "rating" ? { provider: { rating: "desc" as const } } :
                          { createdAt: "desc" as const };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where, orderBy,
        skip:  (page - 1) * limit,
        take:  limit,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          provider: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, username: true } },
          region:   { select: { id: true, name: true } },
          city:     { select: { id: true, name: true } },
          images:   { orderBy: { order: "asc" }, take: 1 },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({
      services,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/services:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { images, tags, ...serviceData } = parsed.data;

    const service = await prisma.service.create({
      data: {
        ...serviceData,
        tags:       JSON.stringify(tags),
        providerId: session.user.id,
        status:     "ACTIVE",
        images: {
          create: images.map((img, i) => ({
            url:      img.url,
            publicId: img.publicId,
            width:    img.width,
            height:   img.height,
            sizeKb:   img.sizeKb,
            order:    i,
          })),
        },
      },
      include: { images: true, category: true, region: true, city: true },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error("POST /api/services:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

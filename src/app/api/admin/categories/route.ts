import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { services: true } } },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/admin/categories:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const body = await req.json() as {
      name: string;
      slug: string;
      icon: string;
      color: string;
      description?: string;
    };

    const { name, slug, icon, color } = body;

    if (!name || !slug || !icon || !color) {
      return NextResponse.json({ error: "الاسم والمعرف والأيقونة واللون مطلوبة" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.serviceCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "المعرف مستخدم بالفعل، يرجى اختيار معرف آخر" }, { status: 409 });
    }

    // Get max order
    const maxOrder = await prisma.serviceCategory.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
        icon,
        color,
        order: nextOrder,
        isActive: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/categories:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;

  try {
    const { action } = await req.json() as { action: string };

    const statusMap: Record<string, string> = {
      activate:  "ACTIVE",
      hide:      "HIDDEN",
      suspend:   "SUSPENDED",
    };

    if (!statusMap[action]) {
      return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id }, select: { id: true } });
    if (!service) return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });

    const updated = await prisma.service.update({
      where: { id }, data: { status: statusMap[action] },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/services/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;

  try {
    const { isActive } = await req.json() as { isActive: boolean };

    const updated = await prisma.serviceCategory.update({
      where: { id },
      data:  { isActive },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/categories/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

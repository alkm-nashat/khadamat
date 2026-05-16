import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const isAdmin      = session?.user?.role === "ADMIN" || isSuperAdmin;
  if (!isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;

  try {
    const { action, role } = await req.json() as { action: string; role?: string };

    const target = await prisma.user.findUnique({
      where: { id }, select: { id: true, role: true, isBlocked: true },
    });
    if (!target) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

    // Can't modify yourself
    if (id === session?.user?.id) {
      return NextResponse.json({ error: "لا يمكنك تعديل حسابك الخاص من هنا" }, { status: 400 });
    }

    // Only SUPER_ADMIN can change roles to ADMIN/SUPER_ADMIN
    if (action === "setRole") {
      if (!role) return NextResponse.json({ error: "الدور مطلوب" }, { status: 400 });
      if (["ADMIN","SUPER_ADMIN"].includes(role) && !isSuperAdmin) {
        return NextResponse.json({ error: "فقط المدير العام يمكنه منح صلاحيات الأدمن" }, { status: 403 });
      }
      const updated = await prisma.user.update({
        where: { id }, data: { role },
        select: { id: true, role: true, isBlocked: true },
      });
      return NextResponse.json(updated);
    }

    if (action === "block") {
      const updated = await prisma.user.update({
        where: { id }, data: { isBlocked: true },
        select: { id: true, role: true, isBlocked: true },
      });
      return NextResponse.json(updated);
    }

    if (action === "unblock") {
      const updated = await prisma.user.update({
        where: { id }, data: { isBlocked: false },
        select: { id: true, role: true, isBlocked: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/admin/users/[id]:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

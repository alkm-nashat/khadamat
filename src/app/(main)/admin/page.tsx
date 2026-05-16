import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui";

export const metadata = { title: "لوحة الأدمن" };

export default async function AdminPage() {
  const [
    totalUsers, blockedUsers,
    activeServices, hiddenServices, suspendedServices,
    totalBookings, completedBookings, pendingBookings,
    totalRatings,
    recentUsers, recentServices,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.service.count({ where: { status: "ACTIVE" } }),
    prisma.service.count({ where: { status: "HIDDEN" } }),
    prisma.service.count({ where: { status: "SUSPENDED" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.rating.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, name: true, username: true, phone: true, role: true, createdAt: true, isBlocked: true },
    }),
    prisma.service.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      include: {
        category: { select: { name: true, icon: true } },
        provider: { select: { name: true, username: true } },
        images:   { take: 1, orderBy: { order: "asc" } },
      },
    }),
  ]);

  const revenue = completedBookings * 10;

  const bigStats = [
    { label: "المستخدمون",     value: totalUsers,        sub: `${blockedUsers} محظور`,    icon: "👥", color: "#1E3A5F",  href: "/admin/users" },
    { label: "الخدمات النشطة", value: activeServices,    sub: `${hiddenServices} مخفية`,  icon: "📦", color: "#059669",  href: "/admin/services" },
    { label: "الحجوزات",       value: totalBookings,     sub: `${pendingBookings} معلقة`, icon: "📋", color: "#0d6efd",  href: "/admin/services" },
    { label: "الإيرادات",      value: `${revenue} ريال`, sub: `${completedBookings} مكتمل`, icon: "💰", color: "#C9A84C", href: "#" },
    { label: "التقييمات",      value: totalRatings,      sub: "إجمالي التقييمات",          icon: "⭐", color: "#d97706",  href: "#" },
  ];

  function roleAr(role: string) {
    return role === "SUPER_ADMIN" ? "مدير" : role === "ADMIN" ? "أدمن" : role === "MODERATOR" ? "مشرف" : "عضو";
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#1E3A5F]">📊 نظرة عامة على المنصة</h1>
        <p className="text-gray-500 text-sm mt-1">إحصائيات وآخر النشاطات</p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {bigStats.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Recent users ─────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[#1E3A5F]">👥 آخر المستخدمين</h2>
            <Link href="/admin/users" className="text-xs font-bold text-[#1E3A5F] hover:underline">
              عرض الكل ←
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center font-bold text-[#1E3A5F] text-sm flex-shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400">@{u.username} · {u.phone}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge status={u.role} />
                  {u.isBlocked && <Badge status="SUSPENDED" customLabel="محظور" />}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent services ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[#1E3A5F]">📦 آخر الخدمات</h2>
            <Link href="/admin/services" className="text-xs font-bold text-[#1E3A5F] hover:underline">
              عرض الكل ←
            </Link>
          </div>
          <div className="space-y-3">
            {recentServices.map((svc) => {
              const img = svc.images[0]?.url;
              return (
                <div key={svc.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    {img
                      ? <Image src={img} alt={svc.title} width={40} height={40} className="w-full h-full object-cover" />
                      : <span className="text-lg">{svc.category.icon}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/services/${svc.id}`}
                      className="text-sm font-bold text-gray-800 truncate block hover:text-[#1E3A5F] hover:underline">
                      {svc.title}
                    </Link>
                    <p className="text-xs text-gray-400">{svc.provider.name} · {svc.category.name}</p>
                  </div>
                  <Badge status={svc.status} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

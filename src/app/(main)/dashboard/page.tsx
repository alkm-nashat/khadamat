import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Badge, StarRating } from "@/components/ui";

export const metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/dashboard");

  const uid = session.user.id;

  const [user, services, recentBookings, pendingProviderBookings] = await Promise.all([
    // User stats
    prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true, name: true, username: true, avatar: true,
        rating: true, totalRatings: true,
        _count: {
          select: {
            services:         { where: { status: "ACTIVE" } },
            bookingsAsClient: true,
            ratingsReceived:  true,
          },
        },
      },
    }),

    // My services
    prisma.service.findMany({
      where:   { providerId: uid },
      orderBy: { createdAt: "desc" },
      take:    10,
      include: {
        category: { select: { name: true, icon: true, color: true } },
        images:   { orderBy: { order: "asc" }, take: 1 },
        city:     { select: { name: true } },
        _count:   { select: { bookings: true } },
      },
    }),

    // My recent bookings (as client)
    prisma.booking.findMany({
      where:   { clientId: uid },
      orderBy: { createdAt: "desc" },
      take:    5,
      include: {
        service: {
          include: {
            images:   { orderBy: { order: "asc" }, take: 1 },
            provider: { select: { name: true } },
            city:     { select: { name: true } },
          },
        },
      },
    }),

    // Pending bookings on MY services
    prisma.booking.findMany({
      where:   { service: { providerId: uid }, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take:    5,
      include: {
        service: { select: { title: true } },
        client:  { select: { name: true, avatar: true } },
      },
    }),
  ]);

  if (!user) redirect("/login");

  const activeServices  = user._count.services;
  const totalBookings   = user._count.bookingsAsClient;
  const totalRatings    = user._count.ratingsReceived;
  const pendingCount    = pendingProviderBookings.length;

  const statCards = [
    { label: "خدماتي النشطة",   value: activeServices, icon: "📦", href: "#services",  color: "#1E3A5F" },
    { label: "طلباتي كعميل",    value: totalBookings,  icon: "🛒", href: "/bookings",   color: "#0d6efd" },
    { label: "طلبات على خدماتي",value: pendingCount,   icon: "⏳", href: "/bookings?role=provider", color: pendingCount > 0 ? "#d97706" : "#6b7280" },
    { label: "تقييماتي",        value: totalRatings,   icon: "⭐", href: "#ratings",    color: "#059669" },
  ];

  function statusLabel(s: string) {
    return s === "PENDING" ? "انتظار" : s === "CONFIRMED" ? "مؤكد" : s === "COMPLETED" ? "مكتمل" : "ملغى";
  }

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-xs text-white/40 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/70">الرئيسية</Link>
            <span>/</span>
            <span className="text-white/70">لوحة التحكم</span>
          </nav>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0 border-2 border-white/20">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">مرحباً، {user.name} 👋</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/60 text-sm">@{user.username}</span>
                {user.totalRatings > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating rating={user.rating} size="sm" />
                    <span className="text-white/80 text-xs font-bold">{user.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Stats grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Link key={s.label} href={s.href}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow text-center group">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black group-hover:scale-105 transition-transform" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </Link>
          ))}
        </div>

        {/* ── Pending bookings alert ───────────────────────────────────────────── */}
        {pendingCount > 0 && (
          <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ backgroundColor: "#fef9c3", border: "1px solid #fde047" }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-bold text-amber-800">
                  لديك {pendingCount} {pendingCount === 1 ? "طلب" : "طلبات"} بانتظار تأكيدك
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {pendingProviderBookings.map((b) => b.service.title).join("، ")}
                </p>
              </div>
            </div>
            <Link href="/bookings?role=provider"
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: "#d97706" }}>
              عرض الطلبات
            </Link>
          </div>
        )}

        {/* ── Quick actions ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <Link href="/services/add"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: "#1E3A5F" }}>
            ➕ إضافة خدمة جديدة
          </Link>
          <Link href="/bookings?role=provider"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border-2 text-[#1E3A5F] hover:bg-[#1E3A5F]/5 transition"
            style={{ borderColor: "#1E3A5F" }}>
            📦 إدارة الطلبات
          </Link>
          <Link href="/profile"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            👤 تعديل الملف الشخصي
          </Link>
          <Link href={`/profile/${user.username}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            👁️ صفحتي العامة
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── My services ────────────────────────────────────────────────────── */}
          <section id="services">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#1E3A5F]">📦 خدماتي</h2>
              <Link href="/services/add" className="text-xs font-bold text-[#1E3A5F] hover:underline">
                + إضافة جديدة
              </Link>
            </div>

            {services.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 text-sm mb-4">لم تضف أي خدمة بعد</p>
                <Link href="/services/add"
                  className="inline-block px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: "#1E3A5F" }}>
                  أضف خدمتك الأولى
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => {
                  const img = svc.images[0]?.url;
                  return (
                    <div key={svc.id}
                      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                      {/* Image */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {img ? (
                          <Image src={img} alt={svc.title} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">{svc.category.icon}</div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/services/${svc.id}`}
                          className="font-bold text-[#1E3A5F] text-sm truncate block hover:underline">
                          {svc.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {svc._count.bookings} حجز · {svc.city?.name}
                        </p>
                      </div>
                      {/* Badge + edit */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge status={svc.status} />
                        <Link href={`/services/edit/${svc.id}`}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                          تعديل
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Recent bookings as client ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#1E3A5F]">🛒 آخر طلباتي</h2>
              <Link href="/bookings" className="text-xs font-bold text-[#1E3A5F] hover:underline">
                عرض الكل
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-gray-500 text-sm mb-4">لم تقم بأي حجز بعد</p>
                <Link href="/services"
                  className="inline-block px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: "#1E3A5F" }}>
                  تصفح الخدمات
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const svc = booking.service;
                  const img = svc.images[0]?.url;
                  return (
                    <Link key={booking.id} href={`/bookings/${booking.id}`}
                      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow group">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {img ? (
                          <Image src={img} alt={svc.title} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📋</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1E3A5F] text-sm truncate group-hover:underline">{svc.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{svc.provider.name} · {svc.city?.name}</p>
                      </div>
                      <Badge status={booking.status} customLabel={statusLabel(booking.status)} />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

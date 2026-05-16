import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui";

export const metadata = { title: "حجوزاتي" };

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ role?: string }>;
}

export default async function BookingsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/bookings");

  const sp   = await searchParams;
  const role = sp.role === "provider" ? "provider" : "client";
  const uid  = session.user.id;

  const bookings = await prisma.booking.findMany({
    where: role === "provider"
      ? { service: { providerId: uid } }
      : { clientId: uid },
    orderBy: { createdAt: "desc" },
    include: {
      service: {
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          images:   { orderBy: { order: "asc" }, take: 1 },
          provider: { select: { id: true, name: true, avatar: true, username: true } },
          city:     { select: { name: true } },
        },
      },
      client: { select: { id: true, name: true, avatar: true, username: true } },
      rating: { select: { id: true, score: true } },
    },
  });

  const tabs = [
    { key: "client",   label: "طلباتي",          icon: "🛒" },
    { key: "provider", label: "خدماتي المحجوزة",  icon: "📦" },
  ];

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs text-white/40 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/70">الرئيسية</Link>
            <span>/</span>
            <span className="text-white/70">الحجوزات</span>
          </nav>
          <h1 className="text-2xl font-black text-white">📋 حجوزاتي</h1>
          <p className="text-white/60 text-sm mt-1">
            {bookings.length > 0 ? `${bookings.length} حجز` : "لا توجد حجوزات بعد"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/bookings?role=${tab.key}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                role === tab.key
                  ? "text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
              style={role === tab.key ? { backgroundColor: "#1E3A5F" } : {}}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Bookings list */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">{role === "provider" ? "📦" : "🛒"}</div>
            <p className="text-gray-600 font-semibold mb-1">
              {role === "provider" ? "لا توجد حجوزات على خدماتك بعد" : "لم تقم بأي حجز بعد"}
            </p>
            <p className="text-sm text-gray-400 mb-5">
              {role === "provider"
                ? "ستظهر هنا طلبات العملاء على خدماتك"
                : "تصفح الخدمات المتاحة واحجز ما يناسبك"}
            </p>
            {role === "client" && (
              <Link
                href="/services"
                className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: "#1E3A5F" }}
              >
                تصفح الخدمات
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const svc     = booking.service;
              const img     = svc.images[0]?.url;
              const isNew   = booking.status === "PENDING";
              const needPay = booking.status === "CONFIRMED" && role === "client" && booking.paymentStatus !== "PAID";
              const canRate = booking.canRate && !booking.rating;

              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow group"
                >
                  {/* Service image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {img ? (
                      <Image src={img} alt={svc.title} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {svc.category.icon}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-[#1E3A5F] text-sm truncate group-hover:underline">
                        {svc.title}
                      </h3>
                      <Badge status={booking.status} />
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      {role === "client" ? (
                        <span>مقدم الخدمة: {svc.provider.name}</span>
                      ) : (
                        <span>العميل: {booking.client.name}</span>
                      )}
                      <span>·</span>
                      <span>{new Date(booking.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>

                    {/* Action hints */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {isNew && role === "provider" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          ⏳ بانتظار تأكيدك
                        </span>
                      )}
                      {needPay && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          💳 ادفع 10 ريال
                        </span>
                      )}
                      {canRate && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          ⭐ قيّم الخدمة
                        </span>
                      )}
                      {booking.rating && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          ✅ تم التقييم {"★".repeat(booking.rating.score)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

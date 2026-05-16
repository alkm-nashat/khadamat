import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Badge, StarRating } from "@/components/ui";
import BookingActions from "./BookingActions";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { service: true } });
  return { title: booking ? `حجز: ${booking.service.title}` : "تفاصيل الحجز" };
}


export default async function BookingDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: {
        include: {
          category: true,
          provider: { select: { id: true, name: true, avatar: true, username: true, rating: true, totalRatings: true, phone: true } },
          images:   { orderBy: { order: "asc" } },
          city:     true,
          region:   true,
        },
      },
      client: { select: { id: true, name: true, avatar: true, username: true, phone: true } },
      rating: true,
    },
  });

  if (!booking) notFound();

  const uid        = session.user.id;
  const isClient   = booking.clientId           === uid;
  const isProvider = booking.service.providerId === uid;
  const isAdmin    = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isClient && !isProvider && !isAdmin) redirect("/bookings");

  const svc = booking.service;
  const img = svc.images[0]?.url;

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs text-white/40 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/70">الرئيسية</Link>
            <span>/</span>
            <Link href="/bookings" className="hover:text-white/70">الحجوزات</Link>
            <span>/</span>
            <span className="text-white/70">تفاصيل الحجز</span>
          </nav>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">تفاصيل الحجز</h1>
              <p className="text-white/50 text-xs mt-1 font-mono">#{booking.id.slice(-8).toUpperCase()}</p>
            </div>
            <Badge status={booking.status} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main column ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Service card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wide">الخدمة</h2>
            <Link href={`/services/${svc.id}`} className="flex gap-4 group">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {img ? (
                  <Image src={img} alt={svc.title} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{svc.category.icon}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[#1E3A5F] text-base group-hover:underline truncate">{svc.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {svc.category.icon} {svc.category.name} · {svc.city?.name}
                </p>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{svc.description}</p>
              </div>
            </Link>
          </div>

          {/* Provider / Client info */}
          {isClient && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wide">مقدم الخدمة</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-[#1E3A5F]">
                  {svc.provider.avatar ? (
                    <Image src={svc.provider.avatar} alt={svc.provider.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    svc.provider.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#1E3A5F]">{svc.provider.name}</p>
                  {booking.status === "CONFIRMED" || booking.status === "COMPLETED" ? (
                    <p className="text-xs text-gray-500 mt-0.5 dir-ltr">📞 {svc.provider.phone}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">رقم الهاتف يظهر بعد تأكيد الحجز</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={svc.provider.rating} size="sm" />
                    <span className="text-xs text-gray-400">({svc.provider.totalRatings})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isProvider && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wide">العميل</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-[#1E3A5F]">
                  {booking.client.avatar ? (
                    <Image src={booking.client.avatar} alt={booking.client.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    booking.client.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#1E3A5F]">{booking.client.name}</p>
                  <p className="text-xs text-gray-500 dir-ltr mt-0.5">📞 {booking.client.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-black text-gray-400 mb-3 uppercase tracking-wide">ملاحظات العميل</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Rating (if exists) */}
          {booking.rating && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wide">التقييم</h2>
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={booking.rating.score} size="lg" />
                <span className="font-black text-xl text-[#1E3A5F]">{booking.rating.score}/5</span>
              </div>
              {booking.rating.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2 bg-gray-50 rounded-xl p-3">
                  "{booking.rating.comment}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wide">مسار الحجز</h2>

            {[
              { label: "تم الطلب",    done: true,                                 date: booking.createdAt },
              { label: "تأكيد الحجز", done: ["CONFIRMED","COMPLETED","CANCELLED"].includes(booking.status),
                cancelled: booking.status === "CANCELLED" },
              { label: "إتمام الدفع", done: booking.paymentStatus === "PAID" },
              { label: "اكتمل",       done: booking.status === "COMPLETED" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                  step.done
                    ? step.cancelled
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {step.done ? (step.cancelled ? "✕" : "✓") : (i + 1)}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${step.done ? "text-gray-800" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {step.date && step.done && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(step.date).toLocaleDateString("ar-SA")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-wide">الرسوم</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">رسوم الخدمة</span>
              <span className="font-black text-[#1E3A5F] text-lg">{booking.serviceFee} ريال</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {booking.paymentStatus === "PAID"
                ? `✅ تم الدفع · ${booking.paymentRef}`
                : "⏳ لم يتم الدفع بعد"}
            </p>
          </div>

          {/* Action buttons (client component) */}
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            paymentStatus={booking.paymentStatus}
            canRate={booking.canRate}
            hasRating={!!booking.rating}
            isClient={isClient}
            isProvider={isProvider}
          />
        </div>
      </div>
    </div>
  );
}

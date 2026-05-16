import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/db";
import { StarRating, Badge } from "@/components/ui";
import BookingButton from "./BookingButton";

// ── بيانات OG/SEO ─────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    select: {
      title:    true,
      description: true,
      images:   { take: 1, orderBy: { order: "asc" }, select: { url: true } },
      category: { select: { name: true, icon: true } },
      city:     { select: { name: true } },
      region:   { select: { name: true } },
      provider: { select: { name: true } },
    },
  });

  if (!service) return { title: "خدمة غير موجودة" };

  const desc    = service.description.slice(0, 160);
  const ogImage = service.images[0]?.url;
  const title   = `${service.category.icon} ${service.title}`;

  return {
    title,
    description: desc,
    keywords: [
      service.category.name,
      service.city.name,
      service.region.name,
      service.provider.name,
      "خدمات السعودية",
    ],
    openGraph: {
      title,
      description: desc,
      type: "article",
      locale: "ar_SA",
      ...(ogImage && {
        images: [{ url: ogImage, width: 1200, height: 630, alt: service.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

// ── جلب بيانات الخدمة ────────────────────────
async function getService(id: string) {
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
      region: true,
      city: true,
      images: { orderBy: { order: "asc" } },
      ratings: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          rater: { select: { id: true, name: true, avatar: true, username: true } },
        },
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!service || service.status !== "ACTIVE") notFound();

  // زيادة المشاهدات
  await prisma.service.update({ where: { id }, data: { views: { increment: 1 } } });

  return service;
}

// ── جلب خدمات مشابهة ─────────────────────────
async function getRelated(categoryId: string, excludeId: string) {
  return prisma.service.findMany({
    where: { categoryId, status: "ACTIVE", id: { not: excludeId } },
    take: 4,
    include: {
      category: true,
      provider: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, username: true } },
      region: true, city: true,
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });
}

// ── معرض الصور ───────────────────────────────
function ImageGallery({ images, title }: { images: { url: string; width: number; height: number; id: string }[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="h-72 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-5xl">
        🖼️
      </div>
    );
  }

  return (
    <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
      {images.map((img, i) => (
        <div
          key={img.id}
          className={`relative overflow-hidden rounded-2xl ${
            i === 0 && images.length === 3 ? "row-span-2" : ""
          }`}
          style={{ height: i === 0 ? (images.length > 1 ? 320 : 400) : 155 }}
        >
          <Image
            src={img.url}
            alt={`${title} - صورة ${i + 1}`}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ))}
    </div>
  );
}

// ── بطاقة مزود الخدمة ────────────────────────
function ProviderCard({
  provider,
}: {
  provider: {
    id: string; name: string; avatar?: string | null; bio?: string | null;
    rating: number; totalRatings: number; username: string;
    city?: string | null; createdAt: Date;
    _count: { services: number };
  };
}) {
  const joinYear = new Date(provider.createdAt).getFullYear();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 text-sm">مزود الخدمة</h3>
      <div className="flex items-start gap-3">
        <Link href={`/profile/${provider.username}`}>
          {provider.avatar ? (
            <Image
              src={provider.avatar}
              alt={provider.name}
              width={52}
              height={52}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className="w-13 h-13 w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              {provider.name.charAt(0)}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${provider.username}`}
            className="font-bold text-gray-900 hover:underline block truncate"
          >
            {provider.name}
          </Link>
          {provider.totalRatings > 0 && (
            <StarRating rating={provider.rating} total={provider.totalRatings} size="sm" />
          )}
          {provider.bio && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{provider.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
        {[
          { label: "خدمة", value: provider._count.services },
          { label: "تقييم", value: provider.totalRatings },
          { label: "منذ", value: joinYear },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-xl py-2">
            <div className="font-black text-base" style={{ color: "#1E3A5F" }}>{stat.value}</div>
            <div className="text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <Link
        href={`/profile/${provider.username}`}
        className="mt-4 w-full block text-center py-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-gray-50"
        style={{ borderColor: "#1E3A5F", color: "#1E3A5F" }}
      >
        عرض الملف الشخصي
      </Link>
    </div>
  );
}

// ── الصفحة الرئيسية ───────────────────────────
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  const related = await getRelated(service.categoryId, id);
  const tags: string[] = JSON.parse(service.tags || "[]");

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* مسار التنقل */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600">الرئيسية</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-gray-600">الخدمات</Link>
          <span>/</span>
          <Link href={`/categories/${service.category.slug}`} className="hover:text-gray-600">
            {service.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{service.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── العمود الرئيسي ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* معرض الصور */}
            <ImageGallery images={service.images} title={service.title} />

            {/* تفاصيل الخدمة */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {/* الشارات */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: service.category.color }}
                >
                  {service.category.icon} {service.category.name}
                </span>
                <Badge status={service.status} />
              </div>

              {/* العنوان */}
              <h1 className="text-2xl font-black mb-3" style={{ color: "#1E3A5F" }}>
                {service.title}
              </h1>

              {/* المعلومات السريعة */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  📍 {service.city.name}، {service.region.name}
                </span>
                <span className="flex items-center gap-1">
                  👁️ {service.views} مشاهدة
                </span>
                <span className="flex items-center gap-1">
                  📋 {service._count.bookings} حجز
                </span>
                {service.deliveryTime && (
                  <span className="flex items-center gap-1">
                    ⏱️ {service.deliveryTime}
                  </span>
                )}
              </div>

              {/* الوصف */}
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                {service.description}
              </div>

              {/* ملاحظة مقترحة */}
              {service.suggestedNote && (
                <div
                  className="rounded-xl p-4 text-sm mt-4"
                  style={{ backgroundColor: "#C9A84C15", borderRight: "3px solid #C9A84C" }}
                >
                  <p className="font-semibold mb-1" style={{ color: "#C9A84C" }}>💬 ملاحظة المزود</p>
                  <p className="text-gray-700">{service.suggestedNote}</p>
                </div>
              )}

              {/* الوسوم */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* التقييمات */}
            {service.ratings.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-800 mb-4">
                  التقييمات ({service._count.bookings})
                </h2>
                <div className="space-y-4">
                  {service.ratings.map((r) => (
                    <div key={r.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      {r.rater.avatar ? (
                        <Image src={r.rater.avatar} alt={r.rater.name} width={36} height={36} className="rounded-full object-cover" />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: "#1E3A5F" }}
                        >
                          {r.rater.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-800">{r.rater.name}</span>
                          <StarRating rating={r.score} size="sm" showCount={false} />
                        </div>
                        {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(r.createdAt).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── الشريط الجانبي ── */}
          <div className="space-y-5">
            {/* بطاقة الحجز */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-20">
              <div className="text-center mb-4">
                <div className="text-3xl font-black" style={{ color: "#1E3A5F" }}>
                  مجاني
                </div>
                <div className="text-xs text-gray-400 mt-0.5">رسوم بعد استلام الخدمة</div>
                <div
                  className="mt-2 inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{ backgroundColor: "#C9A84C20", color: "#C9A84C" }}
                >
                  10 ريال فقط عند الاستلام
                </div>
              </div>

              <BookingButton serviceId={service.id} providerId={service.providerId} />

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                {[
                  "✅ الخدمة مجانية حتى الاستلام",
                  "💳 ادفع 10 ريال فقط بعد الاستلام",
                  "⭐ قيّم الخدمة بعد الدفع",
                ].map((tip) => (
                  <p key={tip}>{tip}</p>
                ))}
              </div>
            </div>

            {/* بطاقة المزود */}
            <ProviderCard provider={service.provider} />
          </div>
        </div>

        {/* خدمات مشابهة */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-black mb-5" style={{ color: "#1E3A5F" }}>
              خدمات مشابهة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="relative h-36 bg-gray-100">
                    {s.images[0] ? (
                      <Image
                        src={s.images[0].url}
                        alt={s.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {s.category.icon}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-900 line-clamp-2">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.city.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

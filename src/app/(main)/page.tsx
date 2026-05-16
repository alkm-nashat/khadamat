import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { ServiceCard, CategoryCard } from "@/components/ui";

// ── جلب البيانات من قاعدة البيانات (SSR) ─────────────
async function getHomeData() {
  const [categories, latestServices, featuredServices] = await Promise.all([
    // التصنيفات مع عدد الخدمات
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { services: { where: { status: "ACTIVE" } } } },
      },
    }),
    // أحدث 8 خدمات
    prisma.service.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        category: true,
        provider: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, username: true } },
        region: true,
        city: true,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    // الأعلى تقييماً (4 خدمات)
    prisma.service.findMany({
      where: { status: "ACTIVE", provider: { totalRatings: { gt: 0 } } },
      orderBy: { provider: { rating: "desc" } },
      take: 4,
      include: {
        category: true,
        provider: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, username: true } },
        region: true,
        city: true,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
  ]);

  return { categories, latestServices, featuredServices };
}

// ── مكوّن Hero ────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24"
      style={{ backgroundColor: "#1E3A5F" }}
    >
      {/* زخارف خلفية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: "#C9A84C" }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: "#C9A84C" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        {/* شعار شيّال */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="شيّال"
            width={130}
            height={72}
            className="object-contain"
            priority
            unoptimized
          />
        </div>

        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{ backgroundColor: "#C9A84C20", color: "#C9A84C", border: "1px solid #C9A84C50" }}
        >
          🇸🇦 منصة الخدمات السعودية
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
          اكتشف الخدمة{" "}
          <span style={{ color: "#C9A84C" }}>المناسبة لك</span>
        </h1>

        <p className="text-white/70 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
          شيّال — منصة تربط مقدمي الخدمات بطالبيها في المملكة العربية السعودية —
          استشارات، عقارات، سفر، ولائم، عناية، وتعليم
        </p>

        {/* شريط البحث */}
        <form action="/services" method="GET" className="max-w-xl mx-auto">
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-xl">
            <input
              type="text"
              name="q"
              placeholder="ابحث عن خدمة..."
              className="flex-1 px-4 py-2 outline-none text-gray-800 bg-transparent text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              بحث
            </button>
          </div>
        </form>

        {/* إحصائيات سريعة */}
        <div className="flex justify-center gap-8 mt-10 text-white/60 text-sm">
          {[
            { label: "خدمة نشطة", value: "+20" },
            { label: "مزود خدمة", value: "+7" },
            { label: "منطقة", value: "5" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-black text-white">{stat.value}</div>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── الصفحة الرئيسية ────────────────────────────────────
export default async function HomePage() {
  const { categories, latestServices, featuredServices } = await getHomeData();

  return (
    <div style={{ backgroundColor: "#F8F6F1" }}>
      {/* Hero */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ── التصنيفات ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "#1E3A5F" }}>
                تصفح التصنيفات
              </h2>
              <p className="text-sm text-gray-500 mt-1">اختر التصنيف المناسب لاحتياجك</p>
            </div>
            <Link
              href="/categories"
              className="text-sm font-semibold hover:underline"
              style={{ color: "#C9A84C" }}
            >
              عرض الكل ←
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                slug={cat.slug}
                icon={cat.icon}
                color={cat.color}
                serviceCount={cat._count.services}
                size="md"
              />
            ))}
          </div>
        </section>

        {/* ── الأعلى تقييماً ── */}
        {featuredServices.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black" style={{ color: "#1E3A5F" }}>
                  ⭐ الأعلى تقييماً
                </h2>
                <p className="text-sm text-gray-500 mt-1">خدمات حظيت بأعلى تقييمات العملاء</p>
              </div>
              <Link
                href="/services?sort=rating"
                className="text-sm font-semibold hover:underline"
                style={{ color: "#C9A84C" }}
              >
                عرض الكل ←
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredServices.map((s) => (
                <ServiceCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  description={s.description}
                  images={s.images}
                  category={s.category}
                  provider={s.provider}
                  region={s.region}
                  city={s.city}
                  views={s.views}
                  status={s.status}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── أحدث الخدمات ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "#1E3A5F" }}>
                🆕 أحدث الخدمات
              </h2>
              <p className="text-sm text-gray-500 mt-1">خدمات أُضيفت مؤخراً على المنصة</p>
            </div>
            <Link
              href="/services"
              className="text-sm font-semibold hover:underline"
              style={{ color: "#C9A84C" }}
            >
              عرض الكل ←
            </Link>
          </div>

          {latestServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestServices.map((s) => (
                <ServiceCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  description={s.description}
                  images={s.images}
                  category={s.category}
                  provider={s.provider}
                  region={s.region}
                  city={s.city}
                  views={s.views}
                  status={s.status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              لا توجد خدمات بعد — كن أول من يضيف خدمة!
            </div>
          )}
        </section>

        {/* ── CTA ── */}
        <section
          className="rounded-3xl p-10 text-center text-white"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-black mb-3">لديك خدمة تقدمها؟</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto text-sm">
            انضم إلى مئات مقدمي الخدمات على المنصة — التسجيل مجاني والخدمة مجانية
          </p>
          <Link
            href="/services/add"
            className="inline-block px-8 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C9A84C", color: "#1E3A5F" }}
          >
            أضف خدمتك الآن ←
          </Link>
        </section>

      </div>
    </div>
  );
}

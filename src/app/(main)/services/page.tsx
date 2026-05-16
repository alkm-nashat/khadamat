import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/db";
import { ServiceCard, EmptyState } from "@/components/ui";
import { ServiceGridSkeleton } from "@/components/ui/SkeletonCard";

export const metadata: Metadata = {
  title: "تصفح الخدمات",
  description: "تصفح مئات الخدمات المتاحة في المملكة العربية السعودية — استشارات، عقارات، سفر، تعليم، وأكثر.",
  openGraph: {
    title: "تصفح الخدمات | شيّال",
    description: "تصفح مئات الخدمات المتاحة في المملكة العربية السعودية.",
    type: "website",
    locale: "ar_SA",
  },
};

interface SearchParams { q?: string; category?: string; region?: string; sort?: string; page?: string; }

async function getServices(params: SearchParams) {
  const page  = Math.max(1, Number(params.page  || 1));
  const limit = 12;
  const where = {
    status: "ACTIVE",
    ...(params.category && { category: { slug: params.category } }),
    ...(params.region   && { region:   { slug: params.region }   }),
    ...(params.q && {
      OR: [
        { title:       { contains: params.q } },
        { description: { contains: params.q } },
      ],
    }),
  };
  const orderBy =
    params.sort === "views"  ? { views: "desc" as const } :
    params.sort === "rating" ? { provider: { rating: "desc" as const } } :
                               { createdAt: "desc" as const };

  const [services, total, categories, regions] = await Promise.all([
    prisma.service.findMany({
      where, orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        provider: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, username: true } },
        region: true,
        city: true,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.service.count({ where }),
    prisma.serviceCategory.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.region.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ]);

  return { services, total, categories, regions, page, limit, totalPages: Math.ceil(total / limit) };
}

function buildUrl(base: SearchParams, overrides: Partial<SearchParams>) {
  const p = { ...base, ...overrides };
  const qs = Object.entries(p)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join("&");
  return `/services${qs ? "?" + qs : ""}`;
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { services, total, categories, regions, page, limit, totalPages } =
    await getServices(params);

  const sortOptions = [
    { value: "latest", label: "الأحدث" },
    { value: "rating", label: "الأعلى تقييماً" },
    { value: "views",  label: "الأكثر مشاهدة" },
  ];

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* رأس الصفحة */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">تصفح الخدمات</h1>
          <p className="text-white/60 text-sm">{total} خدمة متاحة</p>
          {/* شريط البحث */}
          <form method="GET" className="mt-4 max-w-lg">
            <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow">
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="ابحث عن خدمة..."
                className="flex-1 px-3 py-2 outline-none text-sm text-gray-800 bg-transparent"
              />
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.region   && <input type="hidden" name="region"   value={params.region} />}
              {params.sort     && <input type="hidden" name="sort"     value={params.sort} />}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white text-sm font-bold"
                style={{ backgroundColor: "#1E3A5F" }}
              >
                بحث
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── الفلاتر (sidebar) ── */}
          <aside className="w-full lg:w-60 shrink-0 space-y-6">
            {/* التصنيف */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">التصنيف</h3>
              <div className="space-y-1">
                <Link
                  href={buildUrl(params, { category: undefined, page: undefined })}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !params.category ? "font-bold text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={!params.category ? { backgroundColor: "#1E3A5F" } : {}}
                >
                  الكل
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={buildUrl(params, { category: c.slug, page: undefined })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      params.category === c.slug ? "font-bold text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={params.category === c.slug ? { backgroundColor: "#1E3A5F" } : {}}
                  >
                    <span>{c.icon}</span>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* المنطقة */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">المنطقة</h3>
              <div className="space-y-1">
                <Link
                  href={buildUrl(params, { region: undefined, page: undefined })}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !params.region ? "font-bold text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={!params.region ? { backgroundColor: "#1E3A5F" } : {}}
                >
                  الكل
                </Link>
                {regions.map((r) => (
                  <Link
                    key={r.id}
                    href={buildUrl(params, { region: r.slug, page: undefined })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      params.region === r.slug ? "font-bold text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={params.region === r.slug ? { backgroundColor: "#1E3A5F" } : {}}
                  >
                    {r.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ── قائمة الخدمات ── */}
          <div className="flex-1 min-w-0">
            {/* شريط الترتيب */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {total > 0 ? `عرض ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} من ${total}` : "لا توجد نتائج"}
              </p>
              <div className="flex gap-1.5">
                {sortOptions.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl(params, { sort: opt.value, page: undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      (params.sort || "latest") === opt.value
                        ? "text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                    style={(params.sort || "latest") === opt.value ? { backgroundColor: "#1E3A5F" } : {}}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            <Suspense fallback={<ServiceGridSkeleton count={12} />}>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {services.map((s) => (
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
                <EmptyState
                  icon="🔍"
                  title="لا توجد خدمات"
                  description="لم نجد خدمات تطابق بحثك. جرب تغيير الفلاتر أو كلمات البحث."
                  actionLabel="عرض كل الخدمات"
                  actionHref="/services"
                />
              )}
            </Suspense>

            {/* ترقيم الصفحات */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={buildUrl(params, { page: String(page - 1) })}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border text-gray-600 hover:bg-gray-50"
                  >
                    ← السابق
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <Link
                      key={p}
                      href={buildUrl(params, { page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                        p === page ? "text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
                      }`}
                      style={p === page ? { backgroundColor: "#1E3A5F" } : {}}
                    >
                      {p}
                    </Link>
                  ))}
                {page < totalPages && (
                  <Link
                    href={buildUrl(params, { page: String(page + 1) })}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border text-gray-600 hover:bg-gray-50"
                  >
                    التالي →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

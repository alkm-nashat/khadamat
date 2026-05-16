import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { ServiceCard, EmptyState } from "@/components/ui";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ region?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = await prisma.serviceCategory.findUnique({
    where: { slug },
    include: { _count: { select: { services: { where: { status: "ACTIVE" } } } } },
  });
  if (!cat) return { title: "التصنيف" };

  const title = `${cat.icon} ${cat.name}`;
  const desc  = `تصفح ${cat._count.services} خدمة في تصنيف ${cat.name} — شيّال`;

  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | شيّال`,
      description: desc,
      type: "website",
      locale: "ar_SA",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug }  = await params;
  const sp        = await searchParams;
  const page      = Math.max(1, Number(sp.page  || 1));
  const limit     = 12;

  const category = await prisma.serviceCategory.findUnique({
    where: { slug },
    include: { _count: { select: { services: { where: { status: "ACTIVE" } } } } },
  });
  if (!category) notFound();

  const regions = await prisma.region.findMany({
    where: { isActive: true }, orderBy: { order: "asc" },
  });

  const where = {
    categoryId: category.id,
    status: "ACTIVE",
    ...(sp.region && { region: { slug: sp.region } }),
  };

  const orderBy =
    sp.sort === "views"  ? { views: "desc" as const } :
    sp.sort === "rating" ? { provider: { rating: "desc" as const } } :
                           { createdAt: "desc" as const };

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where, orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        provider: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, username: true } },
        region: true, city: true,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.service.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = { region: sp.region, sort: sp.sort, page: sp.page, ...overrides };
    const qs = Object.entries(p)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return `/categories/${slug}${qs ? "?" + qs : ""}`;
  }

  const sortOptions = [
    { value: "latest", label: "الأحدث" },
    { value: "rating", label: "الأعلى تقييماً" },
    { value: "views",  label: "الأكثر مشاهدة" },
  ];

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* رأس الصفحة */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* مسار التنقل */}
          <nav className="text-xs text-white/40 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/70">الرئيسية</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-white/70">التصنيفات</Link>
            <span>/</span>
            <span className="text-white/70">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ backgroundColor: category.color + "30" }}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{category.name}</h1>
              <p className="text-white/60 text-sm mt-1">
                {category._count.services} خدمة متاحة في هذا التصنيف
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* فلاتر المنطقة + الترتيب */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* فلتر المنطقة */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildUrl({ region: undefined, page: undefined })}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                !sp.region ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              style={!sp.region ? { backgroundColor: "#1E3A5F" } : {}}
            >
              كل المناطق
            </Link>
            {regions.map((r) => (
              <Link
                key={r.id}
                href={buildUrl({ region: r.slug, page: undefined })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  sp.region === r.slug ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                style={sp.region === r.slug ? { backgroundColor: "#1E3A5F" } : {}}
              >
                {r.name}
              </Link>
            ))}
          </div>

          {/* الترتيب */}
          <div className="flex gap-1.5 shrink-0">
            {sortOptions.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: undefined })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  (sp.sort || "latest") === opt.value ? "text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                style={(sp.sort || "latest") === opt.value ? { backgroundColor: "#1E3A5F" } : {}}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* عدد النتائج */}
        {total > 0 && (
          <p className="text-sm text-gray-500 mb-5">
            عرض {(page - 1) * limit + 1}–{Math.min(page * limit, total)} من {total} خدمة
          </p>
        )}

        {/* الخدمات */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            icon={category.icon}
            title={`لا توجد خدمات في ${category.name}`}
            description="لم نجد خدمات في هذا التصنيف حتى الآن. كن أول من يضيف خدمة!"
            actionLabel="أضف خدمة الآن"
            actionHref="/services/add"
          />
        )}

        {/* ترقيم الصفحات */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border text-gray-600 hover:bg-gray-50">
                ← السابق
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <Link key={p} href={buildUrl({ page: String(p) })}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold ${
                    p === page ? "text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
                  }`}
                  style={p === page ? { backgroundColor: "#1E3A5F" } : {}}>
                  {p}
                </Link>
              ))}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border text-gray-600 hover:bg-gray-50">
                التالي →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { StarRating, ServiceCard } from "@/components/ui";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true } });
  return { title: user ? `${user.name} | منصة الخدمات` : "الملف الشخصي" };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const provider = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, name: true, username: true, avatar: true, bio: true,
      city: true, rating: true, totalRatings: true, createdAt: true,
      isBlocked: true,
      _count: { select: { services: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!provider || provider.isBlocked) notFound();

  const [services, latestRatings] = await Promise.all([
    prisma.service.findMany({
      where:    { providerId: provider.id, status: "ACTIVE" },
      orderBy:  { createdAt: "desc" },
      take:     12,
      include:  {
        category: true,
        provider: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, username: true } },
        region:   true,
        city:     true,
        images:   { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.rating.findMany({
      where:   { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      take:    5,
      include: {
        rater:   { select: { name: true, avatar: true, username: true } },
        service: { select: { title: true } },
      },
    }),
  ]);

  const joinYear = new Date(provider.createdAt).getFullYear();

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>

      {/* ── Hero / Provider Card ──────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="pt-12 pb-0 px-4">
        <div className="max-w-5xl mx-auto">
          <nav className="text-xs text-white/40 mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/70">الرئيسية</Link>
            <span>/</span>
            <span className="text-white/70">{provider.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 pb-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center flex-shrink-0 shadow-xl">
              {provider.avatar ? (
                <Image src={provider.avatar} alt={provider.name} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">{provider.name.charAt(0)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{provider.name}</h1>
              <p className="text-white/50 text-sm mt-0.5">@{provider.username}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                {provider.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={provider.rating} size="sm" />
                    <span className="text-white font-bold">{provider.rating.toFixed(1)}</span>
                    <span className="text-white/50">({provider.totalRatings})</span>
                  </div>
                )}
                {provider.city && (
                  <span className="text-white/60 flex items-center gap-1">
                    📍 {provider.city}
                  </span>
                )}
                <span className="text-white/60 flex items-center gap-1">
                  📅 عضو منذ {joinYear}
                </span>
                <span className="text-white/60 flex items-center gap-1">
                  📦 {provider._count.services} خدمة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bio ──────────────────────────────────────────────────────────────── */}
      {provider.bio && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-gray-400 mb-2 uppercase tracking-wide">نبذة</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{provider.bio}</p>
          </div>
        </div>
      )}

      <div className={`max-w-5xl mx-auto px-4 ${provider.bio ? "pt-0 pb-10" : "py-8"} space-y-10`}>

        {/* ── Services ─────────────────────────────────────────────────────────── */}
        {services.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-[#1E3A5F] mb-5">
              خدمات {provider.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          </section>
        )}

        {/* ── Ratings ──────────────────────────────────────────────────────────── */}
        {latestRatings.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-[#1E3A5F] mb-5">
              آراء العملاء
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestRatings.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center font-bold text-[#1E3A5F] flex-shrink-0 overflow-hidden">
                        {r.rater.avatar ? (
                          <Image src={r.rater.avatar} alt={r.rater.name} width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          r.rater.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{r.rater.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{r.service.title}</p>
                      </div>
                    </div>
                    <StarRating rating={r.score} size="sm" />
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-3 py-2">
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty */}
        {services.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 font-semibold">لا توجد خدمات نشطة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}

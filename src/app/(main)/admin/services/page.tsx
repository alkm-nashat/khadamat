import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui";
import AdminServiceActions from "./AdminServiceActions";

export const metadata = { title: "إدارة الخدمات" };

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

const STATUS_FILTERS = [
  { value: "",           label: "الكل" },
  { value: "ACTIVE",     label: "نشطة" },
  { value: "HIDDEN",     label: "مخفية" },
  { value: "SUSPENDED",  label: "موقوفة" },
];

export default async function AdminServicesPage({ searchParams }: Props) {
  const sp     = await searchParams;
  const q      = sp.q      || "";
  const status = sp.status || "";
  const page   = Math.max(1, Number(sp.page || 1));
  const limit  = 20;

  const where = {
    ...(status && { status }),
    ...(q && { OR: [{ title: { contains: q } }, { description: { contains: q } }] }),
  };

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        category: { select: { name: true, icon: true, color: true } },
        provider: { select: { id: true, name: true, username: true } },
        city:     { select: { name: true } },
        images:   { take: 1, orderBy: { order: "asc" } },
        _count:   { select: { bookings: true } },
      },
    }),
    prisma.service.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(params: Record<string, string | undefined>) {
    const merged = { q: q || undefined, status: status || undefined, page: String(page), ...params };
    const qs = Object.entries(merged).filter(([,v]) => v).map(([k,v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
    return `/admin/services${qs ? "?" + qs : ""}`;
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#1E3A5F]">📦 إدارة الخدمات</h1>
        <p className="text-gray-500 text-sm mt-1">{total} خدمة</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form method="GET" className="flex gap-2 flex-1">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q}
            placeholder="ابحث في الخدمات..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 bg-white" />
          <button type="submit"
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: "#1E3A5F" }}>
            بحث
          </button>
        </form>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-shrink-0">
          {STATUS_FILTERS.map((f) => (
            <Link key={f.value} href={buildUrl({ status: f.value || undefined, page: "1" })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                status === f.value
                  ? "text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              style={status === f.value ? { backgroundColor: "#1E3A5F" } : {}}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا توجد نتائج</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 font-bold">
                  <th className="px-4 py-3 text-right">الخدمة</th>
                  <th className="px-4 py-3 text-right">مقدم الخدمة</th>
                  <th className="px-4 py-3 text-right">التصنيف</th>
                  <th className="px-4 py-3 text-right">الحجوزات</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map((svc) => {
                  const img = svc.images[0]?.url;
                  return (
                    <tr key={svc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            {img
                              ? <Image src={img} alt={svc.title} width={40} height={40} className="w-full h-full object-cover" />
                              : <span className="text-lg">{svc.category.icon}</span>
                            }
                          </div>
                          <div className="min-w-0">
                            <Link href={`/services/${svc.id}`} target="_blank"
                              className="font-bold text-gray-800 truncate block hover:text-[#1E3A5F] hover:underline max-w-[180px]">
                              {svc.title}
                            </Link>
                            <p className="text-xs text-gray-400">{svc.city?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/profile/${svc.provider.username}`} target="_blank"
                          className="text-xs font-semibold text-gray-700 hover:underline">
                          {svc.provider.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {svc.category.icon} {svc.category.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-center">{svc._count.bookings}</td>
                      <td className="px-4 py-3"><Badge status={svc.status} /></td>
                      <td className="px-4 py-3">
                        <AdminServiceActions serviceId={svc.id} currentStatus={svc.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border text-gray-600 hover:bg-gray-50">
              ← السابق
            </Link>
          )}
          <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border text-gray-600">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl({ page: String(page + 1) })}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border text-gray-600 hover:bg-gray-50">
              التالي →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

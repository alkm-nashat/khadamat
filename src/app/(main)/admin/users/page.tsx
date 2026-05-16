import Link from "next/link";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui";
import AdminUserActions from "./AdminUserActions";

export const metadata = { title: "إدارة المستخدمين" };

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp    = await searchParams;
  const q     = sp.q    || "";
  const page  = Math.max(1, Number(sp.page || 1));
  const limit = 20;

  const where = q ? {
    OR: [
      { name:     { contains: q } },
      { username: { contains: q } },
      { phone:    { contains: q } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
      select: {
        id: true, name: true, username: true, phone: true,
        role: true, isBlocked: true, isVerified: true,
        rating: true, totalRatings: true, createdAt: true,
        _count: { select: { services: true, bookingsAsClient: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(params: Record<string, string | undefined>) {
    const merged = { q: q || undefined, page: String(page), ...params };
    const qs = Object.entries(merged).filter(([,v]) => v).map(([k,v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
    return `/admin/users${qs ? "?" + qs : ""}`;
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1E3A5F]">👥 إدارة المستخدمين</h1>
          <p className="text-gray-500 text-sm mt-1">{total} مستخدم مسجل</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="q" defaultValue={q}
          placeholder="ابحث بالاسم أو اسم المستخدم أو الجوال..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 bg-white"
        />
        <button type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "#1E3A5F" }}>
          بحث
        </button>
        {q && (
          <Link href="/admin/users"
            className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
            ✕ مسح
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا توجد نتائج</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 font-bold">
                  <th className="px-4 py-3 text-right">المستخدم</th>
                  <th className="px-4 py-3 text-right">الجوال</th>
                  <th className="px-4 py-3 text-right">الدور</th>
                  <th className="px-4 py-3 text-right">الخدمات</th>
                  <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.isBlocked ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.phone}</td>
                    <td className="px-4 py-3"><Badge status={u.role} /></td>
                    <td className="px-4 py-3 text-gray-600">{u._count.services}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked
                        ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">محظور</span>
                        : <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">نشط</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <AdminUserActions
                        userId={u.id}
                        currentRole={u.role}
                        isBlocked={u.isBlocked}
                      />
                    </td>
                  </tr>
                ))}
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

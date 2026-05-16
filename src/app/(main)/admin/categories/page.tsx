import prisma from "@/lib/db";
import AdminCategoryActions from "./AdminCategoryActions";

export const metadata = { title: "إدارة التصنيفات" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { services: { where: { status: "ACTIVE" } } } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#1E3A5F]">🏷️ إدارة التصنيفات</h1>
        <p className="text-gray-500 text-sm mt-1">{categories.length} تصنيف</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 font-bold">
              <th className="px-5 py-3 text-right">التصنيف</th>
              <th className="px-5 py-3 text-right">الترتيب</th>
              <th className="px-5 py-3 text-right">الخدمات النشطة</th>
              <th className="px-5 py-3 text-right">الحالة</th>
              <th className="px-5 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className={`hover:bg-gray-50 transition-colors ${!cat.isActive ? "opacity-60" : ""}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: cat.color + "20" }}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{cat.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{cat.order}</td>
                <td className="px-5 py-4 text-gray-600">{cat._count.services}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {cat.isActive ? "✅ نشط" : "⏸ معطّل"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <AdminCategoryActions categoryId={cat.id} isActive={cat.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

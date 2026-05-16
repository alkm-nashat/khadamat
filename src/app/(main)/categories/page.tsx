import Link from "next/link";
import prisma from "@/lib/db";

export const metadata = { title: "التصنيفات" };

export default async function CategoriesPage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { services: { where: { status: "ACTIVE" } } } },
    },
  });

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* رأس الصفحة */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-12 px-4 text-center">
        <h1 className="text-3xl font-black text-white mb-2">تصنيفات الخدمات</h1>
        <p className="text-white/60 text-sm">اختر التصنيف المناسب لاحتياجك</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-white rounded-2xl p-6 shadow-sm border-2 hover:shadow-md transition-all duration-200"
              style={{ borderColor: cat.color + "40" }}
            >
              <div className="flex items-start gap-4">
                {/* الأيقونة */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: cat.color + "20" }}
                >
                  {cat.icon}
                </div>

                {/* النص */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-black text-lg mb-1 group-hover:underline"
                    style={{ color: "#1E3A5F" }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {cat._count.services} خدمة متاحة
                  </p>
                </div>

                {/* سهم */}
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-gray-500 mt-1 rotate-180 transition-colors"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* شريط ملون */}
              <div
                className="mt-4 h-1 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
                style={{ backgroundColor: cat.color }}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

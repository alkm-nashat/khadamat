import prisma from "@/lib/db";
import NewServiceForm from "../NewServiceForm";

export const metadata = { title: "إضافة خدمة جديدة" };

export default async function NewServicePage() {
  const [categories, regions, users] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.region.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.user.findMany({
      where: { isVerified: true, isBlocked: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true, phone: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#1E3A5F]">➕ إضافة خدمة جديدة</h1>
        <p className="text-gray-500 text-sm mt-1">أدخل بيانات الخدمة الجديدة</p>
      </div>

      <NewServiceForm categories={categories} regions={regions} users={users} />
    </div>
  );
}

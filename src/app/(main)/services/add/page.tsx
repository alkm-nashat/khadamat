import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import ServiceForm from "@/components/services/ServiceForm";

export const metadata = { title: "إضافة خدمة جديدة" };

export default async function AddServicePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?from=/services/add");
  }

  const [categories, regions] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, icon: true, color: true },
    }),
    prisma.region.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-xs text-white/40 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/70">الرئيسية</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white/70">الخدمات</Link>
            <span>/</span>
            <span className="text-white/70">إضافة خدمة</span>
          </nav>

          <h1 className="text-2xl font-black text-white">🚀 إضافة خدمة جديدة</h1>
          <p className="text-white/60 text-sm mt-1">
            شارك خبرتك وابدأ في استقبال طلبات العملاء
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Info banner */}
        <div
          className="mb-6 rounded-2xl px-5 py-4 text-sm flex items-start gap-3"
          style={{ backgroundColor: "#C9A84C20", border: "1px solid #C9A84C40" }}
        >
          <span className="text-xl flex-shrink-0">💡</span>
          <div style={{ color: "#7A5C00" }}>
            <p className="font-bold mb-0.5">نشر الخدمة مجاني تماماً</p>
            <p className="text-xs opacity-80">
              يتم تحصيل رسوم رمزية (10 ريال) من العميل فقط عند إتمام الخدمة، مما يضمن جدية الطلبات.
            </p>
          </div>
        </div>

        <ServiceForm
          categories={categories}
          regions={regions}
          mode="add"
        />
      </div>
    </div>
  );
}

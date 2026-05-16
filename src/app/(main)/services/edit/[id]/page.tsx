import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import ServiceForm from "@/components/services/ServiceForm";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: service ? `تعديل: ${service.title}` : "تعديل الخدمة" };
}

export default async function EditServicePage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?from=/services");
  }

  const { id } = await params;

  // Fetch service with images
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!service) notFound();

  // Check ownership (admins can also edit)
  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (service.providerId !== session.user.id && !isAdmin) {
    redirect("/services");
  }

  // Fetch categories, regions, and the cities for the service's current region
  const [categories, regions, initialCities] = await Promise.all([
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
    prisma.city.findMany({
      where: { regionId: service.regionId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Parse tags from JSON string
  let tags: string[] = [];
  try { tags = JSON.parse(service.tags); } catch { tags = []; }

  const initialData = {
    id:            service.id,
    title:         service.title,
    description:   service.description,
    suggestedNote: service.suggestedNote,
    deliveryTime:  service.deliveryTime,
    categoryId:    service.categoryId,
    regionId:      service.regionId,
    cityId:        service.cityId,
    tags,
    images: service.images.map((img) => ({
      url:      img.url,
      publicId: img.publicId,
      width:    img.width,
      height:   img.height,
      sizeKb:   img.sizeKb,
    })),
  };

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
            <Link href={`/services/${id}`} className="hover:text-white/70 truncate max-w-[140px]">
              {service.title}
            </Link>
            <span>/</span>
            <span className="text-white/70">تعديل</span>
          </nav>

          <h1 className="text-2xl font-black text-white">✏️ تعديل الخدمة</h1>
          <p className="text-white/60 text-sm mt-1 truncate">{service.title}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Warning: changes apply immediately */}
        <div
          className="mb-6 rounded-2xl px-5 py-4 text-sm flex items-start gap-3"
          style={{ backgroundColor: "#1E3A5F10", border: "1px solid #1E3A5F25" }}
        >
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div style={{ color: "#1E3A5F" }}>
            <p className="font-bold mb-0.5">التعديلات تُطبَّق فوراً</p>
            <p className="text-xs opacity-70">
              سيتم تحديث الخدمة مباشرة بعد الحفظ وستظهر التغييرات للزوار.
            </p>
          </div>
        </div>

        <ServiceForm
          categories={categories}
          regions={regions}
          mode="edit"
          initialData={initialData}
          initialCities={initialCities}
        />
      </div>
    </div>
  );
}

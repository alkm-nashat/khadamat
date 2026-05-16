import Link from "next/link";
import Image from "next/image";
import StarRating from "./StarRating";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  images: { url: string; width: number; height: number }[];
  category: { name: string; icon: string; color: string };
  provider: { id: string; name: string; avatar?: string | null; rating: number; totalRatings: number };
  region: { name: string };
  city: { name: string };
  views: number;
  status?: string;
}

export default function ServiceCard({
  id,
  title,
  description,
  images,
  category,
  provider,
  region,
  city,
  views,
}: ServiceCardProps) {
  const firstImage = images[0];
  const shortDesc = description.length > 80 ? description.slice(0, 80) + "…" : description;

  return (
    <Link
      href={`/services/${id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* صورة الخدمة */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: category.color + "20" }}
          >
            {category.icon}
          </div>
        )}
        {/* شارة التصنيف */}
        <span
          className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: category.color, color: "#fff" }}
        >
          {category.icon} {category.name}
        </span>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 flex flex-col flex-1">
        {/* العنوان */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-[#1E3A5F] transition-colors line-clamp-2">
          {title}
        </h3>

        {/* الوصف */}
        <p className="text-gray-500 text-xs leading-relaxed mb-3 flex-1">
          {shortDesc}
        </p>

        {/* مزود الخدمة */}
        <div className="flex items-center gap-2 mb-3">
          {provider.avatar ? (
            <Image
              src={provider.avatar}
              alt={provider.name}
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              {provider.name.charAt(0)}
            </div>
          )}
          <span className="text-xs text-gray-600 font-medium truncate">
            {provider.name}
          </span>
        </div>

        {/* تذييل البطاقة */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* المنطقة */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{city.name}، {region.name}</span>
          </div>

          {/* التقييم */}
          {provider.totalRatings > 0 ? (
            <StarRating
              rating={provider.rating}
              total={provider.totalRatings}
              size="sm"
            />
          ) : (
            <span className="text-xs text-gray-400">جديد</span>
          )}
        </div>

        {/* الرسوم */}
        <div
          className="mt-3 text-center text-xs font-bold py-1.5 rounded-lg"
          style={{ backgroundColor: "#C9A84C20", color: "#C9A84C" }}
        >
          رسوم الخدمة: 10 ريال فقط بعد الاستلام
        </div>
      </div>
    </Link>
  );
}

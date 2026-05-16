import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  serviceCount?: number;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function CategoryCard({
  name,
  slug,
  icon,
  color,
  serviceCount,
  size = "md",
}: CategoryCardProps) {
  const sizes = {
    sm: { card: "p-3 rounded-xl", icon: "text-2xl", text: "text-xs" },
    md: { card: "p-4 rounded-2xl", icon: "text-3xl", text: "text-sm" },
    lg: { card: "p-6 rounded-2xl", icon: "text-4xl", text: "text-base" },
  };

  return (
    <Link
      href={`/categories/${slug}`}
      className={`group flex flex-col items-center gap-2 ${sizes[size].card} border-2 border-transparent hover:border-current transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
      style={{
        backgroundColor: color + "15",
        color: color,
      }}
    >
      <div
        className={`${sizes[size].icon} w-12 h-12 flex items-center justify-center rounded-xl`}
        style={{ backgroundColor: color + "25" }}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className={`font-bold ${sizes[size].text}`} style={{ color: "#1E3A5F" }}>
          {name}
        </p>
        {serviceCount !== undefined && (
          <p className="text-xs text-gray-400 mt-0.5">
            {serviceCount} خدمة
          </p>
        )}
      </div>
    </Link>
  );
}

// مكوّن عرض النجوم

interface StarRatingProps {
  rating: number;      // 0–5
  total?: number;      // عدد التقييمات
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function StarRating({
  rating,
  total,
  size = "md",
  showCount = true,
}: StarRatingProps) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill =
            rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
          return (
            <svg
              key={star}
              className={sizes[size]}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {fill === 1 && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#C9A84C"
                />
              )}
              {fill === 0.5 && (
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="#C9A84C" />
                      <stop offset="50%" stopColor="#e5e7eb" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={`url(#half-${star})`}
                  />
                </>
              )}
              {fill === 0 && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#e5e7eb"
                />
              )}
            </svg>
          );
        })}
      </div>
      {showCount && total !== undefined && (
        <span className={`${textSizes[size]} text-gray-500`}>
          ({total})
        </span>
      )}
      {showCount && total === undefined && rating > 0 && (
        <span className={`${textSizes[size]} text-gray-600 font-semibold`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

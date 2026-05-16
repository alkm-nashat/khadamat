// مكوّن دوران التحميل

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  color = "#1E3A5F",
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-t-transparent`}
      style={{ borderColor: `${color}40`, borderTopColor: color }}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

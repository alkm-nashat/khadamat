// شارة الحالة

const variants: Record<string, { bg: string; text: string; label: string }> = {
  // حالة الخدمة
  ACTIVE:     { bg: "#dcfce7", text: "#166534", label: "نشطة" },
  HIDDEN:     { bg: "#f3f4f6", text: "#6b7280", label: "مخفية" },
  SUSPENDED:  { bg: "#fee2e2", text: "#991b1b", label: "موقوفة" },
  // حالة الحجز
  PENDING:    { bg: "#fef9c3", text: "#854d0e", label: "قيد الانتظار" },
  CONFIRMED:  { bg: "#dbeafe", text: "#1e40af", label: "مؤكد" },
  COMPLETED:  { bg: "#dcfce7", text: "#166534", label: "مكتمل" },
  CANCELLED:  { bg: "#fee2e2", text: "#991b1b", label: "ملغي" },
  // حالة الدفع
  PAID:       { bg: "#dcfce7", text: "#166534", label: "مدفوع" },
  // الأدوار
  USER:       { bg: "#f3f4f6", text: "#374151", label: "عضو" },
  MODERATOR:  { bg: "#dbeafe", text: "#1e40af", label: "مشرف" },
  ADMIN:      { bg: "#fef3c7", text: "#92400e", label: "أدمن" },
  SUPER_ADMIN:{ bg: "#ede9fe", text: "#5b21b6", label: "مدير" },
  // حالة البلاغ
  REVIEWED:   { bg: "#dbeafe", text: "#1e40af", label: "قيد المراجعة" },
  RESOLVED:   { bg: "#dcfce7", text: "#166534", label: "تم الحل" },
};

interface BadgeProps {
  status: string;
  customLabel?: string;
}

export default function Badge({ status, customLabel }: BadgeProps) {
  const v = variants[status] ?? { bg: "#f3f4f6", text: "#374151", label: status };
  return (
    <span
      className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: v.bg, color: v.text }}
    >
      {customLabel ?? v.label}
    </span>
  );
}

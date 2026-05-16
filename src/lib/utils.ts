import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** دمج كلاسات Tailwind بشكل آمن */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** تنسيق السعر بالريال السعودي */
export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toLocaleString("ar-SA")} ريال`;
}

/** التحقق من صحة رقم الجوال السعودي */
export function isValidSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s|-/g, "");
  return /^(05\d{8}|5\d{8}|\+9665\d{8}|009665\d{8})$/.test(cleaned);
}

/** تطبيع رقم الجوال السعودي */
export function normalizeSaudiPhone(phone: string): string {
  const cleaned = phone.replace(/\s|-/g, "");
  if (cleaned.startsWith("+966")) return "0" + cleaned.slice(4);
  if (cleaned.startsWith("00966")) return "0" + cleaned.slice(5);
  if (cleaned.startsWith("5") && cleaned.length === 9) return "0" + cleaned;
  return cleaned;
}

/** حساب الوقت النسبي بالعربي */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `قبل ${minutes} ${minutes === 1 ? "دقيقة" : "دقائق"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `قبل ${hours} ${hours === 1 ? "ساعة" : "ساعات"}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `قبل ${days} ${days === 1 ? "يوم" : "أيام"}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `قبل ${weeks} ${weeks === 1 ? "أسبوع" : "أسابيع"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `قبل ${months} ${months === 1 ? "شهر" : "أشهر"}`;
  const years = Math.floor(days / 365);
  return `قبل ${years} ${years === 1 ? "سنة" : "سنوات"}`;
}

/** تنسيق التاريخ بالعربي */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** توليد slug من النص العربي */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/** اختصار النص الطويل */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

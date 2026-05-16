import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import ProfileForm from "./ProfileForm";
import { StarRating } from "@/components/ui";

export const metadata = { title: "ملفي الشخصي" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, username: true, phone: true,
      email: true, avatar: true, bio: true, city: true,
      role: true, rating: true, totalRatings: true, createdAt: true,
      _count: {
        select: {
          services:         { where: { status: "ACTIVE" } },
          bookingsAsClient: true,
          ratingsReceived:  true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  const stats = [
    { label: "خدمات نشطة",    value: user._count.services,         icon: "📦" },
    { label: "حجوزات",         value: user._count.bookingsAsClient, icon: "📋" },
    { label: "تقييمات",        value: user._count.ratingsReceived,  icon: "⭐" },
  ];

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <nav className="text-xs text-white/40 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white/70">الرئيسية</Link>
            <span>/</span>
            <span className="text-white/70">ملفي الشخصي</span>
          </nav>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">👤 ملفي الشخصي</h1>
              <p className="text-white/60 text-sm mt-1">
                تعديل بياناتك الشخصية وصورتك
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black text-[#1E3A5F]">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rating */}
        {user.totalRatings > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-700">تقييمك كمزود خدمة</p>
              <p className="text-xs text-gray-400 mt-0.5">بناءً على {user.totalRatings} تقييم</p>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={user.rating} size="md" />
              <span className="font-black text-[#1E3A5F] text-lg">{user.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: "#1E3A5F" }}
          >
            📊 لوحة التحكم
          </Link>
          <Link
            href="/services/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 text-[#1E3A5F] hover:bg-[#1E3A5F]/5 transition"
            style={{ borderColor: "#1E3A5F" }}
          >
            ➕ إضافة خدمة
          </Link>
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            👁️ عرض صفحتي العامة
          </Link>
        </div>

        {/* Form */}
        <ProfileForm user={user} />
      </div>
    </div>
  );
}

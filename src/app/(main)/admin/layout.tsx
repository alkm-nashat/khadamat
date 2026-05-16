import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

const navLinks = [
  { href: "/admin",            label: "الإحصائيات",   icon: "📊" },
  { href: "/admin/users",      label: "المستخدمون",   icon: "👥" },
  { href: "/admin/services",   label: "الخدمات",      icon: "📦" },
  { href: "/admin/categories", label: "التصنيفات",    icon: "🏷️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  if (!isAdmin) redirect("/");

  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
              {/* Admin badge */}
              <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: "#1E3A5F" }}>
                <p className="text-white font-black text-sm">🔧 لوحة الأدمن</p>
                <p className="text-white/50 text-xs mt-0.5">
                  {session?.user?.role === "SUPER_ADMIN" ? "مدير عام" : "مشرف"}
                </p>
              </div>

              {/* Nav links */}
              <nav className="p-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#1E3A5F] transition-colors"
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="mx-3 my-1 border-t border-gray-100" />

              {/* Back links */}
              <div className="p-2 pb-3">
                <Link href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-50 transition-colors">
                  ← داشبورد المستخدم
                </Link>
                <Link href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-50 transition-colors">
                  ← الرئيسية
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main content ────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

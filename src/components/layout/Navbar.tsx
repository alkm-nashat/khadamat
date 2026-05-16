"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";

// ── أيقونات ───────────────────────────────────────
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// ── روابط التنقل ──────────────────────────────────
const navLinks = [
  { href: "/",            label: "الرئيسية" },
  { href: "/services",    label: "الخدمات" },
  { href: "/categories",  label: "التصنيفات" },
];

// ── المكوّن الرئيسي ───────────────────────────────
export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 shadow-sm"
      style={{ backgroundColor: "#1E3A5F" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* الشعار */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="شيّال"
              width={90}
              height={50}
              className="object-contain"
              priority
              unoptimized
            />
          </Link>

          {/* بحث سريع */}
          <SearchBar />

          {/* روابط التنقل — سطح المكتب */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* الجزء الأيسر */}
          <div className="flex items-center gap-3">
            {/* زر إضافة خدمة */}
            <Link
              href="/services/add"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: "#C9A84C", color: "#1E3A5F" }}
            >
              <PlusIcon />
              أضف خدمة
            </Link>

            {/* حالة المستخدم */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-1.5 transition-colors"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={30}
                      height={30}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: "#C9A84C", color: "#1E3A5F" }}
                    >
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-white text-sm font-medium hidden sm:block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDownIcon />
                </button>

                {/* القائمة المنسدلة */}
                {userMenuOpen && (
                  <>
                    {/* طبقة الإغلاق */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div
                      className="absolute left-0 top-12 w-52 rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20"
                      style={{ backgroundColor: "#fff" }}
                    >
                      {/* معلومات المستخدم */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate" dir="ltr">{user.phone}</p>
                      </div>

                      {/* الروابط */}
                      {[
                        { href: `/profile/${user.username}`, label: "ملفي الشخصي", icon: "👤" },
                        { href: "/bookings",                 label: "حجوزاتي",       icon: "📋" },
                        { href: "/messages",                 label: "الرسائل",        icon: "💬" },
                        { href: "/services/add",             label: "أضف خدمة",       icon: "➕" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-amber-50 transition-colors"
                          style={{ color: "#C9A84C" }}
                        >
                          <span>⚙️</span>
                          لوحة التحكم
                        </Link>
                      )}

                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <span>🚪</span>
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white border border-white/30 hover:bg-white/10 transition-colors"
              >
                دخول / تسجيل
              </Link>
            )}

            {/* زر القائمة — الجوال */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="القائمة"
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* القائمة المنسدلة للجوال */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-white/10 px-4 py-4 space-y-1"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === link.href
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/services/add"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold mt-2"
            style={{ backgroundColor: "#C9A84C", color: "#1E3A5F" }}
          >
            <PlusIcon />
            أضف خدمة
          </Link>
        </div>
      )}
    </header>
  );
}

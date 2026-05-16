import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200" style={{ backgroundColor: "#1E3A5F" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-white/80">

          {/* العمود الأول: الشعار والوصف */}
          <div>
            <div className="mb-3">
              <Image
                src="/logo.png"
                alt="شيّال"
                width={90}
                height={50}
                className="object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              شيّال — منصة سعودية تربط مقدمي الخدمات بطالبيها في جميع أنحاء المملكة العربية السعودية.
            </p>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/services",    label: "تصفح الخدمات" },
                { href: "/categories",  label: "التصنيفات" },
                { href: "/services/add", label: "أضف خدمة" },
                { href: "/login",        label: "تسجيل الدخول" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#C9A84C] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود الثالث: قانوني */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">معلومات</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/terms",   label: "شروط الاستخدام" },
                { href: "/privacy", label: "سياسة الخصوصية" },
                { href: "/about",   label: "عن المنصة" },
                { href: "/contact", label: "تواصل معنا" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#C9A84C] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* الشريط السفلي */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {year} شيّال — جميع الحقوق محفوظة</p>
          <p>🇸🇦 المملكة العربية السعودية</p>
        </div>
      </div>
    </footer>
  );
}

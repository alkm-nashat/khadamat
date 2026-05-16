import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  // المسارات المحمية التي تتطلب تسجيل دخول
  const protectedPaths = [
    "/services/add",
    "/services/edit",
    "/bookings",
    "/profile",
    "/dashboard",
    "/messages",
  ];

  // المسارات التي تتطلب دور ADMIN
  const adminPaths = ["/admin"];

  const path = nextUrl.pathname;

  // تحقق من مسارات الأدمن
  const isAdminPath = adminPaths.some((p) => path.startsWith(p));
  if (isAdminPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, nextUrl)
      );
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // تحقق من المسارات المحمية
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));
  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, nextUrl)
    );
  }

  // إذا كان المستخدم مسجل دخوله وحاول الوصول لصفحة تسجيل الدخول
  if (isLoggedIn && path === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * تطبيق الـ middleware على كل المسارات ماعدا:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - ملفات الصور العامة
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { verifyOTP } from "@/lib/otp";
import { authConfig } from "@/lib/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      phone: string;
      username: string;
      role: string;
      avatar?: string | null;
    };
  }
  interface User {
    id: string;
    name: string;
    phone: string;
    username: string;
    role: string;
    avatar?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        phone: { label: "رقم الجوال", type: "text" },
        code:  { label: "رمز التحقق", type: "text" },
        name:  { label: "الاسم (للتسجيل الجديد)", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        const phone = String(credentials.phone).trim();
        const code  = String(credentials.code).trim();

        // التحقق من OTP
        const { valid, message } = await verifyOTP(phone, code);
        if (!valid) throw new Error(message);

        // البحث عن المستخدم أو إنشاؤه
        let user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
          // مستخدم جديد — نحتاج الاسم
          const name = credentials.name ? String(credentials.name).trim() : "";
          if (!name) throw new Error("الاسم مطلوب للتسجيل الجديد");

          const username = `user_${phone.slice(-7)}_${Date.now().toString(36)}`;
          user = await prisma.user.create({
            data: {
              name,
              username,
              phone,
              role: "USER",
              isVerified: true,
            },
          });
        } else if (!user.isVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true },
          });
          user.isVerified = true;
        }

        if (user.isBlocked) throw new Error("هذا الحساب موقوف");

        return {
          id:       user.id,
          name:     user.name,
          phone:    user.phone,
          username: user.username,
          role:     user.role,
          avatar:   user.avatar,
        };
      },
    }),
  ],
});

/** مساعد: الحصول على الجلسة الحالية في Server Components */
export { auth as getServerSession };

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateOTP, saveOTP, sendOTP, checkRateLimit } from "@/lib/otp";
import prisma from "@/lib/db";

const schema = z.object({
  phone: z
    .string()
    .regex(/^05\d{8}$/, "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;

    // التحقق من معدل الإرسال
    const allowed = await checkRateLimit(phone);
    if (!allowed) {
      return NextResponse.json(
        { error: "تجاوزت الحد المسموح به (3 محاولات كل 10 دقائق)" },
        { status: 429 }
      );
    }

    // التحقق من حالة المستخدم إن كان موجوداً
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser?.isBlocked) {
      return NextResponse.json(
        { error: "هذا الحساب موقوف. تواصل مع الدعم." },
        { status: 403 }
      );
    }

    // توليد وحفظ وإرسال OTP
    const code = generateOTP();
    await saveOTP(phone, code);
    await sendOTP(phone, code);

    return NextResponse.json({
      success: true,
      isNewUser: !existingUser,
      message: "تم إرسال رمز التحقق",
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      { error: "حدث خطأ، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}

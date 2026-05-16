import prisma from "@/lib/db";

/** توليد رمز OTP عشوائي من 6 أرقام */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** إرسال OTP — يُعيد الرمز إذا لم يكن Twilio مُعدَّلاً (وضع Demo) */
export async function sendOTP(
  phone: string,
  code: string
): Promise<{ devCode?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone  = process.env.TWILIO_PHONE_NUMBER;

  const twilioReady =
    accountSid && authToken && fromPhone &&
    accountSid !== "dev_placeholder";

  // وضع التطوير أو Demo (بدون Twilio)
  if (!twilioReady) {
    console.log(`\n📱 [DEMO OTP] ${phone} → ${code}\n`);
    return { devCode: code }; // يُرجع الرمز ليُعرض في الواجهة
  }

  // وضع الإنتاج الحقيقي — Twilio
  const body    = `رمز التحقق لـ شيّال: ${code}\nصالح لمدة 5 دقائق`;
  const encoded = new URLSearchParams({
    To: `+966${phone.slice(1)}`,
    From: fromPhone,
    Body: body,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encoded.toString(),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Twilio error: ${err.message}`);
  }

  return {};
}

/** حفظ OTP في قاعدة البيانات (يحذف القديم أولاً) */
export async function saveOTP(phone: string, code: string): Promise<void> {
  // حذف OTP السابق للجوال نفسه
  await prisma.otpCode.deleteMany({ where: { phone } });

  // حفظ OTP الجديد (صالح 5 دقائق)
  await prisma.otpCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUsed: false,
    },
  });
}

/** التحقق من صحة OTP */
export async function verifyOTP(
  phone: string,
  code: string
): Promise<{ valid: boolean; message: string }> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { valid: false, message: "لم يتم إرسال رمز لهذا الجوال" };
  if (otp.isUsed) return { valid: false, message: "تم استخدام هذا الرمز مسبقاً" };
  if (new Date() > otp.expiresAt)
    return { valid: false, message: "انتهت صلاحية الرمز، أعد الإرسال" };
  if (otp.code !== code)
    return { valid: false, message: "الرمز غير صحيح" };

  // تعليم OTP كمستخدم
  await prisma.otpCode.update({ where: { id: otp.id }, data: { isUsed: true } });
  return { valid: true, message: "تم التحقق بنجاح" };
}

/** التحقق من معدل الإرسال — 3 محاولات كحد أقصى كل 10 دقائق */
export async function checkRateLimit(phone: string): Promise<boolean> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const count = await prisma.otpCode.count({
    where: { phone, createdAt: { gte: tenMinutesAgo } },
  });
  return count < 3;
}

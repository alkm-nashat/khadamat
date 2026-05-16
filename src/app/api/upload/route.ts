import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MAX_SIZE_BYTES = 800 * 1024; // 800 KB
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم إرفاق ملف" }, { status: 400 });
    }

    // التحقق من النوع
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم (JPEG, PNG, WebP فقط)" },
        { status: 400 }
      );
    }

    // التحقق من الحجم
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "حجم الصورة يجب أن لا يتجاوز 800 كيلوبايت" },
        { status: 400 }
      );
    }

    // إنشاء مجلد التحميلات
    const uploadDir = join(process.cwd(), "public", "uploads", "services");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // اسم فريد للملف
    const ext      = file.name.split(".").pop() || "jpg";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filepath = join(uploadDir, filename);

    // حفظ الملف
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const url = `/uploads/services/${filename}`;

    return NextResponse.json({
      url,
      publicId: filename,
      width: 800,
      height: 600,
      sizeKb: Math.round(file.size / 1024),
    });
  } catch (err) {
    console.error("upload error:", err);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}

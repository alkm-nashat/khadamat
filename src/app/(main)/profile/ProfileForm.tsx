"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string; name: string; username: string; phone: string;
  email: string | null; avatar: string | null; bio: string | null;
  city: string | null; role: string; rating: number; totalRatings: number;
  _count: { services: number; bookingsAsClient: number; ratingsReceived: number };
}

const FIELD = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] bg-white transition";

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();

  const [name,   setName]   = useState(user.name   ?? "");
  const [bio,    setBio]    = useState(user.bio     ?? "");
  const [city,   setCity]   = useState(user.city    ?? "");
  const [email,  setEmail]  = useState(user.email   ?? "");
  const [avatar, setAvatar] = useState(user.avatar  ?? "");
  const [preview, setPreview] = useState(user.avatar ?? "");

  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Avatar upload ────────────────────────────────────────────────────────────
  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    if (file.size > 800 * 1024) { alert("الصورة يجب أن تكون أقل من 800 كيلوبايت"); return; }
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      alert("يُسمح فقط بـ JPEG أو PNG أو WebP"); return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "فشل رفع الصورة"); return; }
      setAvatar(data.url);
    } catch { alert("تعذر رفع الصورة"); }
    finally  { setUploading(false); }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (name.trim().length < 2) { setError("الاسم يجب أن يكون حرفين على الأقل"); return; }

    setSaving(true);
    try {
      const res  = await fetch("/api/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:   name.trim(),
          bio:    bio.trim()   || null,
          city:   city.trim()  || null,
          email:  email.trim() || null,
          avatar: avatar       || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "حدث خطأ غير متوقع"); return; }
      setSuccess("✅ تم حفظ التغييرات بنجاح");
      router.refresh();
    } catch { setError("تعذر الاتصال بالخادم"); }
    finally  { setSaving(false); }
  }

  const initials = name ? name.charAt(0) : "؟";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Feedback */}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{success}</div>}

      {/* ── Avatar ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-[#1E3A5F] text-base border-b border-gray-100 pb-3 mb-5">
          📷 الصورة الشخصية
        </h2>
        <div className="flex items-center gap-6">
          {/* Avatar preview */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#1E3A5F]/10 flex items-center justify-center">
              {preview ? (
                <Image src={preview} alt={name} fill className="object-cover" unoptimized={preview.startsWith("blob:")} />
              ) : (
                <span className="text-3xl font-black text-[#1E3A5F]">{initials}</span>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 text-[#1E3A5F] hover:bg-[#1E3A5F]/5 disabled:opacity-50 transition"
              style={{ borderColor: "#1E3A5F" }}
            >
              {uploading ? "جارٍ الرفع..." : "تغيير الصورة"}
            </button>
            {avatar && (
              <button
                type="button"
                onClick={() => { setAvatar(""); setPreview(""); }}
                className="block mt-2 text-xs text-red-500 hover:underline"
              >
                حذف الصورة
              </button>
            )}
            <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP · حد أقصى 800 كيلوبايت</p>
          </div>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={(e) => handleAvatarChange(e.target.files?.[0])} />
        </div>
      </div>

      {/* ── Basic info ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-[#1E3A5F] text-base border-b border-gray-100 pb-3">
          👤 المعلومات الشخصية
        </h2>

        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            maxLength={60} required className={FIELD} />
        </div>

        {/* Username (read-only) */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">اسم المستخدم</label>
          <input type="text" value={`@${user.username}`} readOnly
            className={`${FIELD} bg-gray-50 text-gray-400 cursor-not-allowed`} />
          <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير اسم المستخدم</p>
        </div>

        {/* Phone (read-only) */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">رقم الجوال</label>
          <input type="text" value={user.phone} readOnly
            className={`${FIELD} bg-gray-50 text-gray-400 cursor-not-allowed dir-ltr`} />
          <p className="text-xs text-gray-400 mt-1">رقم الجوال لا يمكن تغييره</p>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            البريد الإلكتروني <span className="text-gray-400 text-xs">(اختياري)</span>
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com" className={`${FIELD} dir-ltr`} />
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            المدينة <span className="text-gray-400 text-xs">(اختياري)</span>
          </label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="مثال: الرياض" maxLength={60} className={FIELD} />
        </div>

        {/* Bio */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700">
              نبذة تعريفية <span className="text-gray-400 text-xs">(اختياري)</span>
            </label>
            <span className={`text-xs ${bio.length > 270 ? "text-amber-500" : "text-gray-400"}`}>
              {bio.length}/300
            </span>
          </div>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك..."
            maxLength={300} rows={4}
            className={`${FIELD} resize-none`} />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full py-3.5 rounded-2xl font-black text-white text-base disabled:opacity-60 transition flex items-center justify-center gap-2"
        style={{ backgroundColor: "#1E3A5F" }}
      >
        {saving
          ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> جارٍ الحفظ...</>
          : "💾 حفظ التغييرات"
        }
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRESET_COLORS = [
  "#6366F1", "#0EA5E9", "#F59E0B", "#EF4444",
  "#EC4899", "#10B981", "#8B5CF6", "#F97316",
  "#06B6D4", "#84CC16", "#14B8A6", "#F43F5E",
];

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[؀-ۿ\s]+/g, (match) => {
      // Transliterate common Arabic words to English for slug
      const map: Record<string, string> = {
        "استشارات": "consultations",
        "عقارات": "real-estate",
        "سفر": "travel",
        "ولائم": "catering",
        "عناية": "wellness",
        "تعليم": "education",
        "تسوق": "shopping",
        "صحة": "health",
        "رياضة": "sports",
        "تقنية": "technology",
      };
      for (const [ar, en] of Object.entries(map)) {
        if (match.trim().includes(ar)) return en;
      }
      return match.trim().replace(/\s+/g, "-");
    })
    .replace(/[^a-z0-9؀-ۿ-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewCategoryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    icon: "📦",
    color: "#6366F1",
  });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugify(name) || prev.slug,
    }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleClose() {
    setOpen(false);
    setError("");
    setForm({ name: "", slug: "", icon: "📦", color: "#6366F1" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ غير متوقع");
        return;
      }

      handleClose();
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 bg-white";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition flex-shrink-0"
        style={{ backgroundColor: "#1E3A5F" }}
      >
        <span className="text-lg leading-none">+</span>
        إضافة تصنيف
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-800 text-lg">إضافة تصنيف جديد</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className={labelClass}>
                  اسم التصنيف <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="مثال: استشارات وقضايا"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  المعرف (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="مثال: consultations"
                  className={`${inputClass} font-mono text-xs`}
                  required
                  dir="ltr"
                />
                <p className="text-xs text-gray-400 mt-1">يُملأ تلقائياً من الاسم — يمكن تعديله</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    الأيقونة (Emoji) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="icon"
                    value={form.icon}
                    onChange={handleChange}
                    placeholder="📦"
                    className={`${inputClass} text-center text-2xl`}
                    required
                    maxLength={4}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    اللون <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 p-0.5"
                    />
                    <input
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="#6366F1"
                      className={`${inputClass} font-mono text-xs flex-1`}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Color presets */}
              <div>
                <label className={labelClass}>ألوان جاهزة</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, color: c }))}
                      className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: form.color === c ? "#1E3A5F" : "transparent",
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">معاينة:</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: form.color + "20" }}
                  >
                    {form.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{form.name || "اسم التصنيف"}</p>
                    <p className="text-xs text-gray-400 font-mono">{form.slug || "slug"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60"
                  style={{ backgroundColor: "#1E3A5F" }}
                >
                  {loading ? "جارٍ الحفظ..." : "إضافة التصنيف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

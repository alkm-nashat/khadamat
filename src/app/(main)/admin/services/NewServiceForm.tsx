"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface Region {
  id: string;
  name: string;
  slug: string;
  cities: City[];
}

interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
}

interface Props {
  categories: Category[];
  regions: Region[];
  users: User[];
}

export default function NewServiceForm({ categories, regions, users }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    providerId: "",
    regionId: "",
    cityId: "",
    deliveryTime: "",
    tags: "",
    image1: "",
    image2: "",
    image3: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRegion = regions.find((r) => r.id === form.regionId);
  const availableCities = selectedRegion?.cities ?? [];

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Reset cityId when region changes
      if (name === "regionId") next.cityId = "";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const images = [form.image1, form.image2, form.image3].filter(Boolean);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId,
          providerId: form.providerId,
          regionId: form.regionId,
          cityId: form.cityId,
          deliveryTime: form.deliveryTime || undefined,
          tags,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ غير متوقع");
        return;
      }

      router.push("/admin/services");
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
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-gray-800 text-base border-b border-gray-100 pb-3">
          📝 المعلومات الأساسية
        </h2>

        <div>
          <label className={labelClass}>
            عنوان الخدمة <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="مثال: استشارة قانونية في العقود التجارية"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            وصف الخدمة <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="أدخل وصفاً تفصيلياً للخدمة..."
            rows={5}
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              التصنيف <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">-- اختر التصنيف --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>وقت التسليم</label>
            <input
              name="deliveryTime"
              value={form.deliveryTime}
              onChange={handleChange}
              placeholder="مثال: خلال 24 ساعة"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>الوسوم (Tags) — مفصولة بفاصلة</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="مثال: قانون، عقود، استشارة"
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-1">افصل بين الوسوم بفاصلة</p>
        </div>
      </div>

      {/* Provider & Location */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-gray-800 text-base border-b border-gray-100 pb-3">
          👤 مقدم الخدمة والموقع
        </h2>

        <div>
          <label className={labelClass}>
            مقدم الخدمة <span className="text-red-500">*</span>
          </label>
          <select
            name="providerId"
            value={form.providerId}
            onChange={handleChange}
            className={inputClass}
            required
          >
            <option value="">-- اختر مقدم الخدمة --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} (@{u.username}) — {u.phone}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              المنطقة <span className="text-red-500">*</span>
            </label>
            <select
              name="regionId"
              value={form.regionId}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">-- اختر المنطقة --</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              المدينة <span className="text-red-500">*</span>
            </label>
            <select
              name="cityId"
              value={form.cityId}
              onChange={handleChange}
              className={inputClass}
              required
              disabled={!form.regionId}
            >
              <option value="">
                {form.regionId ? "-- اختر المدينة --" : "اختر المنطقة أولاً"}
              </option>
              {availableCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-gray-800 text-base border-b border-gray-100 pb-3">
          🖼️ صور الخدمة
        </h2>
        <p className="text-xs text-gray-500">أدخل روابط الصور (اختياري)</p>

        {[
          { name: "image1", label: "الصورة الرئيسية" },
          { name: "image2", label: "الصورة الثانية" },
          { name: "image3", label: "الصورة الثالثة" },
        ].map((img) => (
          <div key={img.name}>
            <label className={labelClass}>{img.label}</label>
            <input
              name={img.name}
              value={form[img.name as keyof typeof form]}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClass}
              type="url"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
          className="px-6 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          {loading ? "جارٍ الحفظ..." : "إضافة الخدمة"}
        </button>
      </div>
    </form>
  );
}

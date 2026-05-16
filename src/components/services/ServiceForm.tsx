"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category { id: string; name: string; icon: string; color: string; }
interface Region   { id: string; name: string; }
interface City     { id: string; name: string; }

interface ImageData {
  url:      string;
  publicId: string;
  width:    number;
  height:   number;
  sizeKb:   number;
  preview?: string; // local blob URL for preview before upload confirms
}

export interface ServiceFormInitialData {
  id:            string;
  title:         string;
  description:   string;
  suggestedNote?: string | null;
  deliveryTime?:  string | null;
  categoryId:    string;
  regionId:      string;
  cityId:        string;
  tags:          string[];
  images: Array<{
    url: string; publicId: string;
    width: number; height: number; sizeKb: number;
  }>;
}

interface Props {
  categories:    Category[];
  regions:       Region[];
  mode:          "add" | "edit";
  initialData?:  ServiceFormInitialData;
  initialCities?: City[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIELD_STYLE =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] bg-white transition";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceForm({
  categories, regions, mode, initialData, initialCities = [],
}: Props) {
  const router = useRouter();

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [title,         setTitle]         = useState(initialData?.title         ?? "");
  const [description,   setDescription]   = useState(initialData?.description   ?? "");
  const [suggestedNote, setSuggestedNote] = useState(initialData?.suggestedNote ?? "");
  const [deliveryTime,  setDeliveryTime]  = useState(initialData?.deliveryTime  ?? "");
  const [categoryId,    setCategoryId]    = useState(initialData?.categoryId    ?? "");
  const [regionId,      setRegionId]      = useState(initialData?.regionId      ?? "");
  const [cityId,        setCityId]        = useState(initialData?.cityId        ?? "");
  const [tags,          setTags]          = useState<string[]>(initialData?.tags ?? []);
  const [tagInput,      setTagInput]      = useState("");

  // ── Images ──────────────────────────────────────────────────────────────────
  const [images, setImages] = useState<(ImageData | null)[]>([
    initialData?.images[0] ? { ...initialData.images[0] } : null,
    initialData?.images[1] ? { ...initialData.images[1] } : null,
    initialData?.images[2] ? { ...initialData.images[2] } : null,
  ]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const fileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // ── Cities ───────────────────────────────────────────────────────────────────
  const [cities,       setCities]       = useState<City[]>(initialCities);
  const [loadingCities,setLoadingCities]= useState(false);

  // ── Submission ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleRegionChange(newRegionId: string) {
    setRegionId(newRegionId);
    setCityId("");
    setCities([]);
    if (!newRegionId) return;
    setLoadingCities(true);
    try {
      const res  = await fetch(`/api/cities?regionId=${newRegionId}`);
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoadingCities(false); }
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.includes(t) || tags.length >= 10) return;
    setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  async function handleFileChange(slot: number, file: File | undefined) {
    if (!file) return;

    if (file.size > 800 * 1024) {
      alert("حجم الصورة يجب ألا يتجاوز 800 كيلوبايت");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("يُسمح فقط بصور JPEG أو PNG أو WebP");
      return;
    }

    // Instant local preview
    const preview = URL.createObjectURL(file);
    setImages((prev) => {
      const next = [...prev];
      next[slot] = { url: "", publicId: "", width: 0, height: 0, sizeKb: 0, preview };
      return next;
    });

    setUploadingSlot(slot);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "فشل رفع الصورة");
        setImages((prev) => { const next=[...prev]; next[slot]=null; return next; });
        return;
      }

      setImages((prev) => {
        const next = [...prev];
        next[slot] = { ...data, preview };
        return next;
      });
    } catch {
      alert("تعذر رفع الصورة، حاول مجدداً");
      setImages((prev) => { const next=[...prev]; next[slot]=null; return next; });
    } finally {
      setUploadingSlot(null);
    }
  }

  function removeImage(slot: number) {
    setImages((prev) => { const next=[...prev]; next[slot]=null; return next; });
    if (fileRefs[slot].current) fileRefs[slot].current!.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (title.trim().length < 5)   return setError("العنوان يجب أن يكون 5 أحرف على الأقل");
    if (description.trim().length < 20) return setError("الوصف يجب أن يكون 20 حرفاً على الأقل");
    if (!categoryId)  return setError("اختر التصنيف");
    if (!regionId)    return setError("اختر المنطقة");
    if (!cityId)      return setError("اختر المدينة");

    const uploadedImages = images
      .filter((img): img is ImageData => img !== null && img.url !== "")
      // strip the local-only `preview` key
      .map(({ preview: _p, ...rest }) => rest);

    const payload = {
      title:         title.trim(),
      description:   description.trim(),
      suggestedNote: suggestedNote.trim() || null,
      deliveryTime:  deliveryTime.trim()  || null,
      categoryId,
      regionId,
      cityId,
      tags,
      images: uploadedImages,
    };

    setSubmitting(true);
    try {
      const url    = mode === "add" ? "/api/services" : `/api/services/${initialData!.id}`;
      const method = mode === "add" ? "POST" : "PUT";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "حدث خطأ غير متوقع"); return; }

      router.push(`/services/${data.id}`);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const charCount = (str: string, max: number) => (
    <span className={`text-xs ${str.length > max * 0.9 ? "text-amber-500" : "text-gray-400"}`}>
      {str.length}/{max}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Section: Basic info ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-[#1E3A5F] text-lg border-b border-gray-100 pb-3">
          📝 المعلومات الأساسية
        </h2>

        {/* Title */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700">
              عنوان الخدمة <span className="text-red-500">*</span>
            </label>
            {charCount(title, 100)}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: تصميم شعار احترافي لشركتك"
            maxLength={100}
            required
            className={FIELD_STYLE}
          />
          <p className="text-xs text-gray-400 mt-1">5–100 حرف</p>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700">
              وصف الخدمة <span className="text-red-500">*</span>
            </label>
            {charCount(description, 2000)}
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اشرح خدمتك بالتفصيل: ماذا تقدم، لمن، وما الذي يميزك..."
            maxLength={2000}
            rows={6}
            required
            className={`${FIELD_STYLE} resize-y`}
          />
          <p className="text-xs text-gray-400 mt-1">20–2000 حرف</p>
        </div>

        {/* Delivery Time */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            مدة التنفيذ
          </label>
          <input
            type="text"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="مثال: 2-3 أيام عمل"
            maxLength={100}
            className={FIELD_STYLE}
          />
        </div>

        {/* Suggested note */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700">
              ملاحظة مقترحة للعميل
            </label>
            {charCount(suggestedNote, 500)}
          </div>
          <textarea
            value={suggestedNote}
            onChange={(e) => setSuggestedNote(e.target.value)}
            placeholder="معلومات تريد أن يعرفها العميل مسبقاً (اختياري)"
            maxLength={500}
            rows={3}
            className={`${FIELD_STYLE} resize-none`}
          />
        </div>
      </section>

      {/* ── Section: Category & Location ────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-[#1E3A5F] text-lg border-b border-gray-100 pb-3">
          📍 التصنيف والموقع
        </h2>

        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            التصنيف <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={FIELD_STYLE}
          >
            <option value="">-- اختر التصنيف --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Region */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              المنطقة <span className="text-red-500">*</span>
            </label>
            <select
              value={regionId}
              onChange={(e) => handleRegionChange(e.target.value)}
              required
              className={FIELD_STYLE}
            >
              <option value="">-- اختر المنطقة --</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              المدينة <span className="text-red-500">*</span>
            </label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              required
              disabled={!regionId || loadingCities}
              className={`${FIELD_STYLE} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">
                {loadingCities ? "جاري التحميل..." : cities.length === 0 && regionId ? "لا توجد مدن" : "-- اختر المدينة --"}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Section: Tags ───────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-[#1E3A5F] text-lg border-b border-gray-100 pb-3">
          🏷️ الوسوم (اختياري)
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder='مثال: تصميم جرافيك — اضغط Enter للإضافة'
            maxLength={50}
            disabled={tags.length >= 10}
            className={`${FIELD_STYLE} flex-1`}
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim() || tags.length >= 10}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            style={{ backgroundColor: "#1E3A5F" }}
          >
            إضافة
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#1E3A5F15", color: "#1E3A5F" }}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="hover:opacity-60 transition leading-none ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">{tags.length}/10 وسوم</p>
      </section>

      {/* ── Section: Images ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-[#1E3A5F] text-lg border-b border-gray-100 pb-3">
          🖼️ صور الخدمة (حتى 3 صور)
        </h2>
        <p className="text-xs text-gray-400">
          الصيغ المقبولة: JPEG, PNG, WebP — الحجم الأقصى: 800 كيلوبايت لكل صورة
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((slot) => {
            const img = images[slot];
            const isUploading = uploadingSlot === slot;

            return (
              <div key={slot} className="relative">
                {img ? (
                  /* Image preview */
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#1E3A5F]/20 group">
                    <Image
                      src={img.preview ?? img.url}
                      alt={`صورة ${slot + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={!!img.preview}
                    />

                    {/* Uploading overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Remove button */}
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => removeImage(slot)}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                      >
                        ×
                      </button>
                    )}

                    {/* Slot label */}
                    {slot === 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                        الرئيسية
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upload zone */
                  <button
                    type="button"
                    onClick={() => fileRefs[slot].current?.click()}
                    disabled={isUploading || uploadingSlot !== null}
                    className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#1E3A5F]/40 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#1E3A5F] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.454 9.09" />
                    </svg>
                    <span className="text-xs font-medium">
                      {slot === 0 ? "الصورة الرئيسية" : `صورة ${slot + 1}`}
                    </span>
                  </button>
                )}

                <input
                  ref={fileRefs[slot]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(slot, e.target.files?.[0])}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Submit ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={submitting || uploadingSlot !== null}
          className="flex-1 py-3.5 rounded-2xl font-black text-white text-base disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>{mode === "add" ? "🚀 نشر الخدمة" : "💾 حفظ التعديلات"}</>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3.5 rounded-2xl font-bold text-gray-600 text-base border border-gray-200 hover:bg-gray-50 transition"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

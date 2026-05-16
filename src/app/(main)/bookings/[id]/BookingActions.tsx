"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId:     string;
  status:        string;
  paymentStatus: string;
  canRate:       boolean;
  hasRating:     boolean;
  isClient:      boolean;
  isProvider:    boolean;
}

export default function BookingActions({
  bookingId, status, paymentStatus, canRate, hasRating, isClient, isProvider,
}: Props) {
  const router = useRouter();

  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState("");
  const [success, setSuccess]       = useState("");
  const [showRate, setShowRate]     = useState(false);
  const [score,    setScore]        = useState(5);
  const [comment,  setComment]      = useState("");
  const [hover,    setHover]        = useState(0);

  async function doAction(action: string) {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(
        action === "confirm" ? "✅ تم تأكيد الحجز" :
        action === "cancel"  ? "تم إلغاء الحجز"   : "تم التحديث"
      );
      router.refresh();
    } catch { setError("تعذر الاتصال بالخادم"); }
    finally  { setLoading(false); }
  }

  async function doPay() {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess("✅ تم الدفع بنجاح! يمكنك الآن تقييم الخدمة");
      router.refresh();
    } catch { setError("تعذر معالجة الدفع"); }
    finally  { setLoading(false); }
  }

  async function doRate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/rate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ score, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess("🌟 شكراً! تم إرسال تقييمك");
      setShowRate(false);
      router.refresh();
    } catch { setError("تعذر إرسال التقييم"); }
    finally  { setLoading(false); }
  }

  const isPending   = status === "PENDING";
  const isConfirmed = status === "CONFIRMED";
  const isActive    = isPending || isConfirmed;
  const needPay     = isClient && isConfirmed && paymentStatus !== "PAID";

  // Nothing to show if booking is done/cancelled and no rating
  if (!isActive && !needPay && !canRate && hasRating) return null;
  if (status === "CANCELLED" && !isActive) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-black text-gray-400 uppercase tracking-wide">الإجراءات</h2>

      {/* Feedback */}
      {error   && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

      {/* ── Provider actions ──────────────────────────────────────────────── */}
      {isProvider && isPending && (
        <button
          onClick={() => doAction("confirm")}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60 transition"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          {loading ? "جارٍ التأكيد..." : "✅ تأكيد الحجز"}
        </button>
      )}

      {isProvider && isActive && (
        <button
          onClick={() => doAction("cancel")}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 transition"
        >
          رفض / إلغاء الحجز
        </button>
      )}

      {/* ── Client actions ────────────────────────────────────────────────── */}
      {isClient && isPending && (
        <button
          onClick={() => doAction("cancel")}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition"
        >
          إلغاء الطلب
        </button>
      )}

      {/* Pay button */}
      {needPay && (
        <div>
          <p className="text-xs text-gray-500 mb-3 text-center">
            الخدمة مؤكدة — ادفع 10 ريال لإتمامها وفتح التقييم
          </p>
          <button
            onClick={doPay}
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-white text-sm disabled:opacity-60 transition"
            style={{ backgroundColor: "#C9A84C" }}
          >
            {loading ? "جارٍ المعالجة..." : "💳 ادفع 10 ريال"}
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            بيئة تجريبية — لن يتم خصم رصيد حقيقي
          </p>
        </div>
      )}

      {/* Rating form */}
      {canRate && !hasRating && (
        !showRate ? (
          <button
            onClick={() => setShowRate(true)}
            className="w-full py-3 rounded-xl font-bold text-sm border-2 text-[#1E3A5F] hover:bg-[#1E3A5F]/5 transition"
            style={{ borderColor: "#1E3A5F" }}
          >
            ⭐ قيّم الخدمة
          </button>
        ) : (
          <form onSubmit={doRate} className="space-y-3">
            <p className="text-sm font-bold text-gray-700 text-center">ما تقييمك لهذه الخدمة؟</p>

            {/* Star selector */}
            <div className="flex justify-center gap-1 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScore(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={(hover || score) >= s ? "text-amber-400" : "text-gray-200"}>★</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400">
              {["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"][hover || score]}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تعليقك (اختياري)..."
              maxLength={500}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-60 transition"
                style={{ backgroundColor: "#1E3A5F" }}
              >
                {loading ? "جارٍ الإرسال..." : "إرسال التقييم"}
              </button>
              <button
                type="button"
                onClick={() => setShowRate(false)}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-500 border border-gray-200 hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
}

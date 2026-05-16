"use client";

import { Suspense } from "react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// ── أيقونات بسيطة ─────────────────────────────
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

// ── مكوّن خانات OTP ───────────────────────────
function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const digit = e.target.value.replace(/\D/, "").slice(-1);
    const arr = value.split("");
    arr[idx] = digit;
    const next = arr.join("").padEnd(6, "").slice(0, 6);
    onChange(next.trimEnd());
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all"
          style={{
            borderColor: value[i] ? "#1E3A5F" : "#d1d5db",
            backgroundColor: value[i] ? "#EEF2FF" : "#fff",
            color: "#1E3A5F",
          }}
        />
      ))}
    </div>
  );
}

// ── المكوّن الداخلي (يستخدم useSearchParams) ───
function LoginForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  // المراحل: "phone" | "otp"
  const [stage,     setStage]     = useState<"phone" | "otp">("phone");
  const [phone,     setPhone]     = useState("");
  const [otp,       setOtp]       = useState("");
  const [name,      setName]      = useState("");
  const [isNew,     setIsNew]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [countdown, setCountdown] = useState(0);

  // عداد إعادة الإرسال
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── إرسال OTP ────────────────────────────────
  const sendOtp = async () => {
    setError("");
    if (!/^05\d{8}$/.test(phone)) {
      setError("أدخل رقم جوال سعودي صحيح (05XXXXXXXX)");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setIsNew(data.isNewUser);
      setStage("otp");
      setCountdown(60);
    } finally {
      setLoading(false);
    }
  };

  // ── التحقق من OTP وتسجيل الدخول ─────────────
  const verifyAndLogin = async () => {
    setError("");
    if (otp.length < 6) { setError("أدخل الرمز المكوّن من 6 أرقام"); return; }
    if (isNew && !name.trim()) { setError("الاسم مطلوب للتسجيل"); return; }
    setLoading(true);
    try {
      const result = await signIn("otp", {
        phone,
        code: otp,
        name: name.trim(),
        redirect: false,
      });
      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "الرمز غير صحيح أو منتهي الصلاحية" : result.error);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden"
      style={{ backgroundColor: "#fff" }}
    >
      {/* الرأس */}
      <div
        className="px-8 py-5 text-center text-white"
        style={{ backgroundColor: "#1E3A5F" }}
      >
        <div className="flex justify-center mb-2">
          <Image
            src="/logo.png"
            alt="شيّال"
            width={100}
            height={56}
            className="object-contain"
            priority
            unoptimized
          />
        </div>
        <div className="text-sm opacity-80">
          {stage === "phone" ? "أدخل رقم جوالك للمتابعة" : "أدخل رمز التحقق"}
        </div>
      </div>

      <div className="px-8 py-8 space-y-5">

        {/* ── المرحلة 1: إدخال الجوال ── */}
        {stage === "phone" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                رقم الجوال
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <PhoneIcon />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/, "").slice(0, 10))}
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  className="w-full pr-10 pl-4 py-3 border-2 rounded-xl text-lg tracking-widest outline-none transition-all"
                  style={{
                    borderColor: phone.length === 10 ? "#1E3A5F" : "#e5e7eb",
                    textAlign: "left",
                  }}
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                مثال: 0512345678 — سيُرسل رمز تحقق لجوالك
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              onClick={sendOtp}
              disabled={loading || phone.length < 10}
              className="w-full py-3 rounded-xl font-bold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              {loading ? "جارٍ الإرسال..." : "إرسال رمز التحقق"}
            </button>
          </>
        )}

        {/* ── المرحلة 2: إدخال OTP ── */}
        {stage === "otp" && (
          <>
            <div className="text-center text-sm text-gray-500">
              أُرسل رمز التحقق إلى{" "}
              <span className="font-bold text-gray-800" dir="ltr">{phone}</span>
              {process.env.NODE_ENV === "development" && (
                <span className="block mt-1 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  🛠️ وضع التطوير: ابحث عن الرمز في console السيرفر
                </span>
              )}
            </div>

            {/* حقل الاسم للمستخدمين الجدد */}
            {isNew && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-400 mr-2">(مستخدم جديد)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all"
                  style={{ borderColor: name ? "#1E3A5F" : "#e5e7eb" }}
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                رمز التحقق (6 أرقام)
              </label>
              <OtpBoxes value={otp} onChange={setOtp} />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              onClick={verifyAndLogin}
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl font-bold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#C9A84C" }}
            >
              {loading ? "جارٍ التحقق..." : isNew ? "تسجيل وإنشاء الحساب" : "تسجيل الدخول"}
            </button>

            {/* إعادة الإرسال */}
            <div className="text-center">
              {countdown > 0 ? (
                <span className="text-sm text-gray-400">
                  إعادة الإرسال بعد{" "}
                  <span className="font-bold text-gray-700">{countdown}</span> ثانية
                </span>
              ) : (
                <button
                  onClick={() => { setOtp(""); sendOtp(); }}
                  className="text-sm font-semibold"
                  style={{ color: "#1E3A5F" }}
                >
                  إعادة إرسال الرمز
                </button>
              )}
            </div>

            <button
              onClick={() => { setStage("phone"); setOtp(""); setError(""); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-1"
            >
              ← تغيير رقم الجوال
            </button>
          </>
        )}
      </div>

      {/* التذييل */}
      <div className="px-8 pb-6 text-center text-xs text-gray-400">
        بالتسجيل، تقبل{" "}
        <a href="/terms" className="underline">شروط الاستخدام</a>{" "}
        و{" "}
        <a href="/privacy" className="underline">سياسة الخصوصية</a>
      </div>
    </div>
  );
}

// ── الصفحة الرئيسية (مع Suspense) ────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden bg-white">
          <div className="px-8 py-5 text-center text-white flex justify-center" style={{ backgroundColor: "#1E3A5F" }}>
            <Image src="/logo.png" alt="شيّال" width={100} height={56} className="object-contain" unoptimized />
          </div>
          <div className="px-8 py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#1E3A5F" }} />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"];
const ROLE_LABELS: Record<string, string> = {
  USER: "عضو", MODERATOR: "مشرف", ADMIN: "أدمن", SUPER_ADMIN: "مدير"
};

export default function AdminUserActions({
  userId, currentRole, isBlocked,
}: { userId: string; currentRole: string; isBlocked: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  async function doAction(action: string, role?: string) {
    setLoading(true); setOpen(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, role }),
      });
      if (res.ok) router.refresh();
      else { const d = await res.json(); alert(d.error); }
    } catch { alert("حدث خطأ"); }
    finally { setLoading(false); }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
      >
        {loading ? "..." : "⚙️ إجراء"}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-8 z-20 bg-white rounded-xl border border-gray-200 shadow-lg w-44 overflow-hidden">
            {/* Block/Unblock */}
            <button
              onClick={() => doAction(isBlocked ? "unblock" : "block")}
              className={`w-full text-right px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition ${
                isBlocked ? "text-green-700" : "text-red-600"
              }`}
            >
              {isBlocked ? "✅ إلغاء الحظر" : "🚫 حظر المستخدم"}
            </button>

            <div className="border-t border-gray-100 mx-2" />

            {/* Role change */}
            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">تغيير الدور</p>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => doAction("setRole", r)}
                disabled={r === currentRole}
                className={`w-full text-right px-3 py-1.5 text-xs hover:bg-gray-50 transition ${
                  r === currentRole ? "font-black text-[#1E3A5F] bg-[#1E3A5F]/5" : "text-gray-700 font-medium"
                }`}
              >
                {r === currentRole && "✓ "}{ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

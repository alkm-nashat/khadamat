"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCategoryActions({
  categoryId, isActive,
}: { categoryId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) router.refresh();
      else { const d = await res.json(); alert(d.error); }
    } catch { alert("حدث خطأ"); }
    finally { setLoading(false); }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition disabled:opacity-50 ${
        isActive
          ? "border-gray-200 text-gray-600 hover:bg-gray-50"
          : "border-green-200 text-green-700 hover:bg-green-50"
      }`}
    >
      {loading ? "..." : isActive ? "⏸ تعطيل" : "✅ تفعيل"}
    </button>
  );
}

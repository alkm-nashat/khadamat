"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS: Record<string, { label: string; next: string; style: string }[]> = {
  ACTIVE:    [{ label: "إخفاء",    next: "hide",      style: "text-amber-700" },
              { label: "إيقاف",    next: "suspend",   style: "text-red-600"   }],
  HIDDEN:    [{ label: "تفعيل",    next: "activate",  style: "text-green-700" },
              { label: "إيقاف",    next: "suspend",   style: "text-red-600"   }],
  SUSPENDED: [{ label: "تفعيل",    next: "activate",  style: "text-green-700" },
              { label: "إخفاء",    next: "hide",      style: "text-amber-700" }],
};

export default function AdminServiceActions({
  serviceId, currentStatus,
}: { serviceId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  async function doAction(action: string) {
    setLoading(true); setOpen(false);
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
      else { const d = await res.json(); alert(d.error); }
    } catch { alert("حدث خطأ"); }
    finally { setLoading(false); }
  }

  const actions = ACTIONS[currentStatus] ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "..." : "⚙️ إجراء"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-20 bg-white rounded-xl border border-gray-200 shadow-lg w-36 overflow-hidden">
            {actions.map((a) => (
              <button key={a.next} onClick={() => doAction(a.next)}
                className={`w-full text-right px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition ${a.style}`}>
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

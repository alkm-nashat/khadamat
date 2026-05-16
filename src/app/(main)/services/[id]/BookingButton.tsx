"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BookingButton({
  serviceId,
  providerId,
}: {
  serviceId: string;
  providerId: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwner = session?.user?.id === providerId;

  const handleBook = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/services/${serviceId}`);
      return;
    }
    if (isOwner) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/bookings/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  if (isOwner) {
    return (
      <div className="w-full py-3 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">
        هذه خدمتك
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleBook}
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60"
        style={{ backgroundColor: "#1E3A5F" }}
      >
        {loading ? "جارٍ الحجز..." : session ? "احجز الآن" : "سجّل دخولك للحجز"}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </>
  );
}

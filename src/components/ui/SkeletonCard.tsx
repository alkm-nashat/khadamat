"use client";

// ── Skeleton بطاقة خدمة ─────────────────────────────────────
export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton شبكة بطاقات ─────────────────────────────────────
export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Skeleton صفحة قائمة الخدمات (مع الـ Sidebar) ────────────
export function ServicesPageSkeleton() {
  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      {/* رأس */}
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-3 animate-pulse">
          <div className="h-8 bg-white/20 rounded w-48" />
          <div className="h-4 bg-white/10 rounded w-24" />
          <div className="h-10 bg-white/20 rounded-xl max-w-lg mt-4" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* sidebar */}
        <div className="w-60 shrink-0 space-y-4 animate-pulse">
          <div className="bg-white rounded-2xl p-4 h-52" />
          <div className="bg-white rounded-2xl p-4 h-40" />
        </div>
        {/* grid */}
        <div className="flex-1">
          <ServiceGridSkeleton count={9} />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton صفحة تفاصيل الخدمة ─────────────────────────────
export function ServiceDetailSkeleton() {
  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }} className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* breadcrumb */}
        <div className="flex gap-2 mb-6">
          {[80, 60, 100, 140].map((w, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: w }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* main */}
          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-72 bg-gray-200 rounded-2xl col-span-1 row-span-2" />
              <div className="h-36 bg-gray-200 rounded-2xl" />
              <div className="h-36 bg-gray-200 rounded-2xl" />
            </div>
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </div>
          </div>
          {/* sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 h-52" />
            <div className="bg-white rounded-2xl p-5 h-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton صفحة التصنيف ────────────────────────────────────
export function CategoryPageSkeleton() {
  return (
    <div style={{ backgroundColor: "#F8F6F1", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#1E3A5F" }} className="py-12 px-4 animate-pulse">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-8 bg-white/20 rounded w-48" />
            <div className="h-4 bg-white/10 rounded w-32" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ServiceGridSkeleton count={8} />
      </div>
    </div>
  );
}

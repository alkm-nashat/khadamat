"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface SearchResult {
  services: {
    id: string; title: string;
    category: { icon: string; name: string; color: string };
    city: { name: string };
    images: { url: string }[];
  }[];
  categories: { id: string; name: string; slug: string; icon: string; color: string }[];
}

export default function SearchBar() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const router  = useRef(useRouter());
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef   = useRef<HTMLDivElement>(null);
  const timer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // إغلاق عند النقر خارج المكوّن
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.current.push(`/services?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults =
    results && (results.services.length > 0 || results.categories.length > 0);

  return (
    <div ref={boxRef} className="relative w-full max-w-xs hidden md:block">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 focus-within:bg-white rounded-xl px-3 py-2 transition-colors group">
          {/* أيقونة بحث */}
          <svg
            className="w-4 h-4 text-white/50 group-focus-within:text-gray-400 shrink-0"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => hasResults && setOpen(true)}
            placeholder="بحث سريع..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40 group-focus-within:text-gray-800 group-focus-within:placeholder-gray-400 min-w-0"
          />
          {loading && (
            <div className="w-3.5 h-3.5 border border-white/40 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
        </div>
      </form>

      {/* نتائج البحث */}
      {open && hasResults && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* التصنيفات */}
          {results.categories.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs text-gray-400 px-2 py-1 font-semibold">التصنيفات</p>
              {results.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    {cat.icon}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* الخدمات */}
          {results.services.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-400 px-2 py-1 font-semibold">الخدمات</p>
              {results.services.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/services/${svc.id}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {svc.images[0] ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={svc.images[0].url} alt={svc.title} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <span
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: svc.category.color + "20" }}
                    >
                      {svc.category.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{svc.title}</p>
                    <p className="text-xs text-gray-400">{svc.city.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* عرض كل النتائج */}
          <div className="px-4 py-2.5 border-t border-gray-100">
            <button
              onClick={() => {
                setOpen(false);
                router.current.push(`/services?q=${encodeURIComponent(query.trim())}`);
              }}
              className="text-xs font-semibold w-full text-center hover:underline"
              style={{ color: "#1E3A5F" }}
            >
              عرض كل نتائج "{query}" ←
            </button>
          </div>
        </div>
      )}

      {/* لا توجد نتائج */}
      {open && results && !hasResults && query.length >= 2 && (
        <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 text-center">
          <p className="text-sm text-gray-500">لا توجد نتائج لـ "{query}"</p>
        </div>
      )}
    </div>
  );
}

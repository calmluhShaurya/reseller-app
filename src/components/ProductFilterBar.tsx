"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/utils";

export default function ProductFilterBar({
  categories,
}: {
  categories: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const category = searchParams.get("category") ?? "all";
  const availability = searchParams.get("availability") ?? "all";
  const sort = searchParams.get("sort") ?? "recent";

  const allCategories = Array.from(
    new Set([...CATEGORIES, ...categories])
  ).sort();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam("q", search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, SKU, category…"
          className="w-full rounded border border-border bg-surface py-2 pl-8 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={availability}
          onChange={(e) => updateParam("availability", e.target.value)}
          className="rounded border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Availability</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="recent">Recently Added</option>
          <option value="updated">Recently Updated</option>
          <option value="name">Name</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>
    </div>
  );
}

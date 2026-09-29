import Link from "next/link";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import ProductImage from "@/components/ProductImage";
import StatusBadge from "@/components/StatusBadge";
import ProductFilterBar from "@/components/ProductFilterBar";
import { listProducts, getCategoriesInUse } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  availability?: string;
  sort?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const [{ items, total, pageSize }, categories] = await Promise.all([
    listProducts({
      search: sp.q,
      category: sp.category,
      availability: sp.availability as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | undefined,
      sort: sp.sort as "name" | "price_asc" | "price_desc" | "recent" | "updated" | undefined,
      page,
    }),
    getCategoriesInUse(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = Boolean(sp.q || sp.category || sp.availability);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Products</h1>
            <p className="mt-1 text-sm text-muted">
              {total} product{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="h-10" />}>
          <ProductFilterBar categories={categories} />
        </Suspense>

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="rounded border border-border bg-surface p-10 text-center">
              <p className="text-sm font-medium">
                {hasFilters ? "No products found." : "No products yet."}
              </p>
              {!hasFilters && (
                <p className="mt-1 text-sm text-muted">
                  Check back soon for new inventory.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group rounded border border-border bg-surface overflow-hidden hover:border-accent transition-colors"
                >
                  <ProductImage
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-32 w-full sm:h-36"
                  />
                  <div className="p-3">
                    <div className="text-sm font-medium leading-tight line-clamp-1">
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{p.category}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {formatCurrency(p.sellingPrice)}
                      </span>
                      <StatusBadge stock={p.stock} threshold={p.lowStockThreshold} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/products?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  ...(sp.category ? { category: sp.category } : {}),
                  ...(sp.availability ? { availability: sp.availability } : {}),
                  ...(sp.sort ? { sort: sp.sort } : {}),
                  page: String(p),
                }).toString()}`}
                className={`h-8 w-8 flex items-center justify-center rounded text-sm font-medium ${
                  p === page
                    ? "bg-accent text-accent-foreground"
                    : "border border-border hover:bg-[var(--background)]"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

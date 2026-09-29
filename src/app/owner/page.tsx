import Link from "next/link";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import ProductFilterBar from "@/components/ProductFilterBar";
import OwnerProductRow from "@/components/owner/OwnerProductRow";
import { getDashboardStats, listProducts, getCategoriesInUse } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  availability?: string;
  sort?: string;
  page?: string;
};

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const [stats, { items, total, pageSize }, categories] = await Promise.all([
    getDashboardStats(),
    listProducts({
      search: sp.q,
      category: sp.category,
      availability: sp.availability as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | undefined,
      sort: sp.sort as "name" | "price_asc" | "price_desc" | "recent" | "updated" | undefined,
      page,
      pageSize: 50,
    }),
    getCategoriesInUse(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Owner Dashboard</h1>
            <p className="mt-1 text-sm text-muted">
              Inventory overview and product management.
            </p>
          </div>
          <Link
            href="/owner/products/add"
            className="hidden sm:inline-flex items-center gap-1.5 rounded bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            <span className="text-base leading-none">+</span> Add Product
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Products" value={stats.totalProducts} />
          <StatCard label="Total Units" value={stats.totalUnits} />
          <StatCard label="Low Stock" value={stats.lowStock} tone="low" />
          <StatCard label="Out of Stock" value={stats.outOfStock} tone="out" />
          <StatCard label="Inventory Cost" value={formatCurrency(stats.inventoryCost)} />
          <StatCard label="Inventory Value" value={formatCurrency(stats.inventoryValue)} />
        </div>

        <div className="mt-8 sm:hidden">
          <Link
            href="/owner/products/add"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground"
          >
            <span className="text-base leading-none">+</span> Add Product
          </Link>
        </div>

        <div className="mt-8">
          <Suspense fallback={<div className="h-10" />}>
            <ProductFilterBar categories={categories} />
          </Suspense>
        </div>

        <div className="mt-4 overflow-x-auto rounded border border-border bg-surface">
          {items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium">No products yet.</p>
              <p className="mt-1 text-sm text-muted">
                Add your first product to start building your inventory.
              </p>
              <Link
                href="/owner/products/add"
                className="mt-4 inline-flex items-center gap-1.5 rounded bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                + Add Product
              </Link>
            </div>
          ) : (
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-0 py-2.5 font-medium">Category</th>
                  <th className="px-0 py-2.5 font-medium">Stock</th>
                  <th className="px-0 py-2.5 font-medium">Cost</th>
                  <th className="px-0 py-2.5 font-medium">Selling Price</th>
                  <th className="px-0 py-2.5 font-medium">Status</th>
                  <th className="px-0 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="px-4">
                {items.map((p) => (
                  <OwnerProductRow key={p.id} product={p} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/owner?page=${p}`}
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "low" | "out";
}) {
  const toneClass =
    tone === "low"
      ? "text-[var(--status-low)]"
      : tone === "out"
      ? "text-[var(--status-out)]"
      : "text-foreground";

  return (
    <div className="rounded border border-border bg-surface p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

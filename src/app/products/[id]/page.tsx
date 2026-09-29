import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ProductImage from "@/components/ProductImage";
import StatusBadge from "@/components/StatusBadge";
import { getProductById } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [product, session] = await Promise.all([
    getProductById(productId),
    getSession(),
  ]);

  if (!product) notFound();

  const isOwner = session?.role === "OWNER";
  const profit = parseFloat(product.sellingPrice) - parseFloat(product.costPrice);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/products"
          className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
        >
          ← Back to products
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full rounded border border-border"
          />

          <div>
            <div className="text-sm font-medium text-muted">{product.category}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-2xl font-semibold">
                {formatCurrency(product.sellingPrice)}
              </span>
              <StatusBadge stock={product.stock} threshold={product.lowStockThreshold} />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-foreground/90">
              {product.description || "No description provided."}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 rounded border border-border bg-surface p-4 text-sm">
              <div>
                <dt className="text-muted">SKU</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-muted">Category</dt>
                <dd className="font-medium">{product.category}</dd>
              </div>
              <div>
                <dt className="text-muted">Stock</dt>
                <dd className="font-medium">{product.stock} units</dd>
              </div>
              <div>
                <dt className="text-muted">Units Sold</dt>
                <dd className="font-medium">{product.unitsSold}</dd>
              </div>
            </dl>

            {isOwner && (
              <div className="mt-4 rounded border border-border bg-surface p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  Owner Information
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted">Supplier</dt>
                    <dd className="font-medium">{product.supplier || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Purchase Price</dt>
                    <dd className="font-medium">{formatCurrency(product.costPrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Profit / Unit</dt>
                    <dd className="font-medium">{formatCurrency(profit)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Inventory Value</dt>
                    <dd className="font-medium">
                      {formatCurrency(parseFloat(product.sellingPrice) * product.stock)}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/owner/products/${product.id}/edit`}
                  className="mt-4 inline-block rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-[var(--background)]"
                >
                  Edit Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

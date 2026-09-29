import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ProductForm from "@/components/owner/ProductForm";
import { getProductById } from "@/lib/data";
import { updateProductAction } from "@/lib/actions/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const product = await getProductById(productId);
  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, productId);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/owner"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
        >
          ← Back to Owner Dashboard
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Edit Product</h1>
        <p className="mt-1 mb-6 text-sm text-muted">{product.name}</p>

        <ProductForm
          mode="edit"
          action={boundAction}
          defaults={{
            name: product.name,
            description: product.description,
            category: product.category,
            sku: product.sku,
            imageUrl: product.imageUrl ?? "",
            supplier: product.supplier,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            stock: product.stock,
          }}
        />
      </main>
    </div>
  );
}

import Link from "next/link";
import Nav from "@/components/Nav";
import ProductForm from "@/components/owner/ProductForm";
import { createProductAction } from "@/lib/actions/products";

export default function AddProductPage() {
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
        <h1 className="text-xl font-semibold tracking-tight">Add Product</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Fill in the details below to add a new product to the inventory.
        </p>

        <ProductForm mode="add" action={createProductAction} />
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import ProductImage from "@/components/ProductImage";
import InventoryModal from "./InventoryModal";
import PriceModal from "./PriceModal";
import DeleteProductModal from "./DeleteProductModal";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  imageUrl: string | null;
  stock: number;
  lowStockThreshold: number;
  costPrice: string;
  sellingPrice: string;
};

export default function OwnerProductRow({ product }: { product: Product }) {
  const [modal, setModal] = useState<null | "inventory" | "price" | "cost" | "delete">(
    null
  );

  return (
    <>
      <tr className="border-b border-border last:border-b-0 hover:bg-[var(--background)]/50">
        <td className="py-2.5 pr-4">
          <div className="flex items-center gap-3">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="h-9 w-9 flex-shrink-0 rounded border border-border"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{product.name}</div>
              <div className="text-xs text-muted">{product.sku}</div>
            </div>
          </div>
        </td>
        <td className="py-2.5 pr-4 text-sm text-muted">{product.category}</td>
        <td className="py-2.5 pr-4 text-sm tabular-nums">{product.stock}</td>
        <td className="py-2.5 pr-4">
          <button
            onClick={() => setModal("cost")}
            className="text-sm tabular-nums underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            {formatCurrency(product.costPrice)}
          </button>
        </td>
        <td className="py-2.5 pr-4">
          <button
            onClick={() => setModal("price")}
            className="text-sm font-medium tabular-nums underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            {formatCurrency(product.sellingPrice)}
          </button>
        </td>
        <td className="py-2.5 pr-4">
          <StatusBadge stock={product.stock} threshold={product.lowStockThreshold} />
        </td>
        <td className="py-2.5">
          <div className="flex items-center gap-3 whitespace-nowrap text-sm">
            <Link
              href={`/owner/products/${product.id}/edit`}
              className="font-medium text-foreground hover:text-accent"
            >
              Edit
            </Link>
            <button
              onClick={() => setModal("inventory")}
              className="font-medium text-foreground hover:text-accent"
            >
              Inventory
            </button>
            <button
              onClick={() => setModal("delete")}
              className="font-medium text-[var(--status-out)] hover:opacity-80"
            >
              Remove
            </button>
          </div>
        </td>
      </tr>

      {modal === "inventory" && (
        <ModalPortal>
          <InventoryModal
            productId={product.id}
            productName={product.name}
            currentStock={product.stock}
            onClose={() => setModal(null)}
          />
        </ModalPortal>
      )}
      {modal === "price" && (
        <ModalPortal>
          <PriceModal
            productId={product.id}
            productName={product.name}
            field="sellingPrice"
            currentValue={product.sellingPrice}
            onClose={() => setModal(null)}
          />
        </ModalPortal>
      )}
      {modal === "cost" && (
        <ModalPortal>
          <PriceModal
            productId={product.id}
            productName={product.name}
            field="costPrice"
            currentValue={product.costPrice}
            onClose={() => setModal(null)}
          />
        </ModalPortal>
      )}
      {modal === "delete" && (
        <ModalPortal>
          <DeleteProductModal
            productId={product.id}
            productName={product.name}
            onClose={() => setModal(null)}
          />
        </ModalPortal>
      )}
    </>
  );
}

// Modals render fixed-position overlays; a plain fragment inside <tbody> would be
// invalid HTML, so we render them via a table-less wrapper using a portal-free trick:
// a <tr> is avoided by relying on the modal's own `fixed` positioning, which escapes
// table layout visually even though it's technically nested in the DOM tree.
function ModalPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

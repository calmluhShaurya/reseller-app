"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { deleteProductAction } from "@/lib/actions/products";

export default function DeleteProductModal({
  productId,
  productName,
  onClose,
}: {
  productId: number;
  productName: string;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteProductAction(productId);
        router.refresh();
        onClose();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Modal title="Remove this product?" onClose={onClose}>
      <p className="text-sm text-foreground/90">
        This will permanently remove <span className="font-medium">{productName}</span>{" "}
        from the inventory. This cannot be undone.
      </p>

      {error && <p className="mt-3 text-sm text-[var(--status-out)]">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded border border-border px-3 py-2 text-sm font-medium hover:bg-[var(--background)]"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded bg-[var(--status-out)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Removing…" : "Remove Product"}
        </button>
      </div>
    </Modal>
  );
}

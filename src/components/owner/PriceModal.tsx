"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import SubmitButton from "@/components/SubmitButton";
import { changePriceAction, type ActionResult } from "@/lib/actions/products";
import { formatCurrency } from "@/lib/utils";

const initialState: ActionResult = {};

export default function PriceModal({
  productId,
  productName,
  field,
  currentValue,
  onClose,
}: {
  productId: number;
  productName: string;
  field: "sellingPrice" | "costPrice";
  currentValue: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const boundAction = changePriceAction.bind(null, productId);
  const [state, formAction] = useActionState(boundAction, initialState);
  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => {
        router.refresh();
        onClose();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [state.success, router, onClose]);

  const label = field === "sellingPrice" ? "Selling Price" : "Purchase Price";

  return (
    <Modal title={`${label} — ${productName}`} onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="field" value={field} />

        <div className="text-sm text-muted">
          Current price:{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(currentValue)}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">New price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
              $
            </span>
            <input
              type="number"
              name="value"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded border border-border bg-background py-2 pl-6 pr-3 text-sm outline-none focus:border-accent"
              autoFocus
            />
          </div>
        </div>

        {parseFloat(currentValue) !== parseFloat(value || "0") &&
          !isNaN(parseFloat(value)) && (
            <div className="rounded bg-[var(--background)] px-3 py-2 text-sm">
              {formatCurrency(currentValue)} →{" "}
              <span className="font-semibold">{formatCurrency(value || "0")}</span>
            </div>
          )}

        {state?.error && (
          <p className="text-sm text-[var(--status-out)]">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-[var(--status-in)]">{state.success}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-3 py-2 text-sm font-medium hover:bg-[var(--background)]"
          >
            Cancel
          </button>
          <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}

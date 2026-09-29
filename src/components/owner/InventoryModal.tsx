"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import SubmitButton from "@/components/SubmitButton";
import { adjustStockAction, type ActionResult } from "@/lib/actions/products";

const initialState: ActionResult = {};

export default function InventoryModal({
  productId,
  productName,
  currentStock,
  onClose,
}: {
  productId: number;
  productName: string;
  currentStock: number;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"ADD" | "REMOVE" | "SET">("ADD");
  const [amount, setAmount] = useState(0);
  const router = useRouter();

  const boundAction = adjustStockAction.bind(null, productId);
  const [state, formAction] = useActionState(boundAction, initialState);

  const preview =
    mode === "ADD"
      ? currentStock + amount
      : mode === "REMOVE"
      ? currentStock - amount
      : amount;

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => {
        router.refresh();
        onClose();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [state.success, router, onClose]);

  return (
    <Modal title={`Update Inventory — ${productName}`} onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value={mode} />

        <div className="text-sm text-muted">
          Current Stock: <span className="font-medium text-foreground">{currentStock}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 rounded border border-border p-1">
          {(["ADD", "REMOVE", "SET"] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-2 py-1.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-[var(--background)]"
              }`}
            >
              {m === "ADD" ? "Add" : m === "REMOVE" ? "Remove" : "Set"}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {mode === "ADD" && "Add"}
            {mode === "REMOVE" && "Remove"}
            {mode === "SET" && "Set Stock To"}
          </label>
          <input
            type="number"
            name="amount"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            autoFocus
          />
        </div>

        <div className="rounded bg-[var(--background)] px-3 py-2 text-sm">
          New Stock:{" "}
          <span className={`font-semibold ${preview < 0 ? "text-[var(--status-out)]" : ""}`}>
            {preview}
          </span>
        </div>

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

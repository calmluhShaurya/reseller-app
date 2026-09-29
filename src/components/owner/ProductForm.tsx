"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { CATEGORIES } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/products";

const initialState: ActionResult = {};

type Defaults = {
  name: string;
  description: string;
  category: string;
  sku: string;
  imageUrl: string;
  supplier: string;
  costPrice: string;
  sellingPrice: string;
  stock: number;
};

export default function ProductForm({
  mode,
  action,
  defaults,
}: {
  mode: "add" | "edit";
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaults?: Partial<Defaults>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded border border-[var(--status-out)] bg-[var(--status-out-bg)] px-3 py-2 text-sm text-[var(--status-out)]">
          {state.error}
        </div>
      )}

      <Section title="Basic Information">
        <Field label="Product name">
          <input
            name="name"
            required
            defaultValue={defaults?.name}
            className={inputClass}
            placeholder="Nike Hoodie"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={4}
            defaultValue={defaults?.description}
            className={inputClass}
            placeholder="Brief description of the product…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              name="category"
              required
              defaultValue={defaults?.category ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="SKU">
            <input
              name="sku"
              required
              defaultValue={defaults?.sku}
              className={`${inputClass} uppercase`}
              placeholder="NK-HOOD-001"
            />
          </Field>
        </div>

        <Field label="Image URL">
          <input
            name="imageUrl"
            type="url"
            defaultValue={defaults?.imageUrl}
            className={inputClass}
            placeholder="https://example.com/product.jpg"
          />
        </Field>
      </Section>

      <Section title="Business Information">
        <Field label="Supplier">
          <input
            name="supplier"
            defaultValue={defaults?.supplier}
            className={inputClass}
            placeholder="Guangzhou Textile Trading Co."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Purchase price">
            <PriceInput name="costPrice" defaultValue={defaults?.costPrice} />
          </Field>
          <Field label="Selling price">
            <PriceInput name="sellingPrice" defaultValue={defaults?.sellingPrice} />
          </Field>
        </div>
      </Section>

      {mode === "add" && (
        <Section title="Inventory">
          <Field label="Starting stock quantity">
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={defaults?.stock ?? 0}
              className={`${inputClass} max-w-[160px]`}
            />
          </Field>
        </Section>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <SubmitButton pendingLabel={mode === "add" ? "Saving…" : "Updating…"}>
          {mode === "add" ? "Save Product" : "Save Changes"}
        </SubmitButton>
        <a
          href="/owner"
          className="rounded border border-border px-4 py-2 text-sm font-medium hover:bg-[var(--background)]"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function PriceInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
        $
      </span>
      <input
        name={name}
        type="number"
        step="0.01"
        min="0"
        required
        defaultValue={defaultValue}
        className={`${inputClass} pl-6`}
        placeholder="0.00"
      />
    </div>
  );
}

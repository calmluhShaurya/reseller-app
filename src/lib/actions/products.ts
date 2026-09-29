"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logActivity, getProductBySku } from "@/lib/data";
import { formatCurrency, slugifySku } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionResult = { error?: string; success?: string };

async function requireOwner() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  description: z.string().trim().optional().default(""),
  category: z.string().trim().min(1, "Category is required."),
  sku: z.string().trim().min(2, "SKU is required."),
  imageUrl: z.string().trim().optional().default(""),
  supplier: z.string().trim().optional().default(""),
  costPrice: z.coerce.number().min(0, "Purchase price cannot be negative."),
  sellingPrice: z.coerce
    .number()
    .gt(0, "Selling price must be greater than $0."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
});

export async function createProductAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireOwner().catch(() => null);
  if (!session) return { error: "You are not authorized to do this." };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    sku: formData.get("sku"),
    imageUrl: formData.get("imageUrl"),
    supplier: formData.get("supplier"),
    costPrice: formData.get("costPrice"),
    sellingPrice: formData.get("sellingPrice"),
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const sku = slugifySku(data.sku);

  const existingSku = await getProductBySku(sku);
  if (existingSku) {
    return { error: `SKU "${sku}" is already in use.` };
  }

  const [created] = await db
    .insert(products)
    .values({
      name: data.name,
      description: data.description,
      category: data.category,
      sku,
      imageUrl: data.imageUrl || null,
      supplier: data.supplier,
      costPrice: data.costPrice.toFixed(2),
      sellingPrice: data.sellingPrice.toFixed(2),
      stock: data.stock,
    })
    .returning();

  await logActivity({
    userId: session.userId,
    productId: created.id,
    productName: created.name,
    action: "PRODUCT_ADDED",
    newValue: `${formatCurrency(data.sellingPrice)}, ${data.stock} units`,
  });

  revalidatePath("/owner");
  revalidatePath("/products");
  redirect("/owner");
}

export async function updateProductAction(
  productId: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireOwner().catch(() => null);
  if (!session) return { error: "You are not authorized to do this." };

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));
  const product = existing[0];
  if (!product) return { error: "Product not found." };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    sku: formData.get("sku"),
    imageUrl: formData.get("imageUrl"),
    supplier: formData.get("supplier"),
    costPrice: formData.get("costPrice"),
    sellingPrice: formData.get("sellingPrice"),
    stock: product.stock,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const sku = slugifySku(data.sku);

  if (sku !== product.sku) {
    const clash = await getProductBySku(sku);
    if (clash) return { error: `SKU "${sku}" is already in use.` };
  }

  const priceChanged =
    parseFloat(product.sellingPrice) !== data.sellingPrice;
  const costChanged = parseFloat(product.costPrice) !== data.costPrice;

  await db
    .update(products)
    .set({
      name: data.name,
      description: data.description,
      category: data.category,
      sku,
      imageUrl: data.imageUrl || null,
      supplier: data.supplier,
      costPrice: data.costPrice.toFixed(2),
      sellingPrice: data.sellingPrice.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  await logActivity({
    userId: session.userId,
    productId: product.id,
    productName: data.name,
    action: "PRODUCT_EDITED",
  });

  if (priceChanged) {
    await logActivity({
      userId: session.userId,
      productId: product.id,
      productName: data.name,
      action: "PRICE_CHANGED",
      previousValue: formatCurrency(product.sellingPrice),
      newValue: formatCurrency(data.sellingPrice),
    });
  }

  if (costChanged) {
    await logActivity({
      userId: session.userId,
      productId: product.id,
      productName: data.name,
      action: "COST_CHANGED",
      previousValue: formatCurrency(product.costPrice),
      newValue: formatCurrency(data.costPrice),
    });
  }

  revalidatePath("/owner");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect("/owner");
}

export async function deleteProductAction(productId: number) {
  const session = await requireOwner();

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));
  const product = existing[0];
  if (!product) return;

  await db.delete(products).where(eq(products.id, productId));

  await logActivity({
    userId: session.userId,
    productId: null,
    productName: product.name,
    action: "PRODUCT_REMOVED",
  });

  revalidatePath("/owner");
  revalidatePath("/products");
}

const stockSchema = z.object({
  mode: z.enum(["ADD", "REMOVE", "SET"]),
  amount: z.coerce.number().int().min(0, "Enter a valid quantity."),
});

export async function adjustStockAction(
  productId: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireOwner().catch(() => null);
  if (!session) return { error: "You are not authorized to do this." };

  const parsed = stockSchema.safeParse({
    mode: formData.get("mode"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));
  const product = existing[0];
  if (!product) return { error: "Product not found." };

  const { mode, amount } = parsed.data;
  let newStock = product.stock;
  if (mode === "ADD") newStock = product.stock + amount;
  if (mode === "REMOVE") newStock = product.stock - amount;
  if (mode === "SET") newStock = amount;

  if (newStock < 0) {
    return { error: "Stock cannot go below 0." };
  }

  await db
    .update(products)
    .set({ stock: newStock, updatedAt: new Date() })
    .where(eq(products.id, productId));

  await logActivity({
    userId: session.userId,
    productId: product.id,
    productName: product.name,
    action: "INVENTORY_CHANGED",
    previousValue: `${product.stock} units`,
    newValue: `${newStock} units`,
  });

  revalidatePath("/owner");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);

  return { success: `Stock updated to ${newStock}.` };
}

const priceSchema = z.object({
  field: z.enum(["sellingPrice", "costPrice"]),
  value: z.coerce.number(),
});

export async function changePriceAction(
  productId: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireOwner().catch(() => null);
  if (!session) return { error: "You are not authorized to do this." };

  const parsed = priceSchema.safeParse({
    field: formData.get("field"),
    value: formData.get("value"),
  });
  if (!parsed.success) {
    return { error: "Invalid price." };
  }

  const { field, value } = parsed.data;

  if (field === "sellingPrice" && value <= 0) {
    return { error: "Selling price must be greater than $0." };
  }
  if (field === "costPrice" && value < 0) {
    return { error: "Purchase price cannot be negative." };
  }

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));
  const product = existing[0];
  if (!product) return { error: "Product not found." };

  const oldValue = field === "sellingPrice" ? product.sellingPrice : product.costPrice;

  await db
    .update(products)
    .set({ [field]: value.toFixed(2), updatedAt: new Date() })
    .where(eq(products.id, productId));

  await logActivity({
    userId: session.userId,
    productId: product.id,
    productName: product.name,
    action: field === "sellingPrice" ? "PRICE_CHANGED" : "COST_CHANGED",
    previousValue: formatCurrency(oldValue),
    newValue: formatCurrency(value),
  });

  revalidatePath("/owner");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);

  return { success: `Updated to ${formatCurrency(value)}.` };
}

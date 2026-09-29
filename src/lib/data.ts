import { db } from "@/db";
import { products, activities, users } from "@/db/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getStockStatus } from "./utils";

export type ProductFilters = {
  search?: string;
  category?: string;
  availability?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  sort?: "name" | "price_asc" | "price_desc" | "recent" | "updated";
  page?: number;
  pageSize?: number;
};

export async function listProducts(filters: ProductFilters = {}) {
  const {
    search,
    category,
    availability,
    sort = "recent",
    page = 1,
    pageSize = 24,
  } = filters;

  const conditions = [];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.sku, term),
        ilike(products.category, term)
      )
    );
  }

  if (category && category !== "all") {
    conditions.push(eq(products.category, category));
  }

  if (availability === "OUT_OF_STOCK") {
    conditions.push(eq(products.stock, 0));
  } else if (availability === "LOW_STOCK") {
    conditions.push(
      and(
        sql`${products.stock} > 0`,
        sql`${products.stock} <= ${products.lowStockThreshold}`
      )
    );
  } else if (availability === "IN_STOCK") {
    conditions.push(sql`${products.stock} > ${products.lowStockThreshold}`);
  }

  const where = conditions.length ? and(...conditions) : undefined;

  let orderBy;
  switch (sort) {
    case "name":
      orderBy = asc(products.name);
      break;
    case "price_asc":
      orderBy = asc(products.sellingPrice);
      break;
    case "price_desc":
      orderBy = desc(products.sellingPrice);
      break;
    case "updated":
      orderBy = desc(products.updatedAt);
      break;
    case "recent":
    default:
      orderBy = desc(products.createdAt);
      break;
  }

  const offset = (page - 1) * pageSize;

  const [rows, countRes] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(where),
  ]);

  return {
    items: rows,
    total: countRes[0]?.count ?? 0,
    page,
    pageSize,
  };
}

export async function getProductById(id: number) {
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}

export async function getProductBySku(sku: string) {
  const rows = await db.select().from(products).where(eq(products.sku, sku));
  return rows[0] ?? null;
}

export async function getCategoriesInUse(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .orderBy(asc(products.category));
  return rows.map((r) => r.category);
}

export async function getDashboardStats() {
  const rows = await db.select().from(products);
  const totalProducts = rows.length;
  const totalUnits = rows.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = rows.filter(
    (p) => getStockStatus(p.stock, p.lowStockThreshold) === "LOW_STOCK"
  ).length;
  const outOfStock = rows.filter(
    (p) => getStockStatus(p.stock, p.lowStockThreshold) === "OUT_OF_STOCK"
  ).length;
  const inventoryCost = rows.reduce(
    (sum, p) => sum + parseFloat(p.costPrice) * p.stock,
    0
  );
  const inventoryValue = rows.reduce(
    (sum, p) => sum + parseFloat(p.sellingPrice) * p.stock,
    0
  );

  return {
    totalProducts,
    totalUnits,
    lowStock,
    outOfStock,
    inventoryCost,
    inventoryValue,
    potentialProfit: inventoryValue - inventoryCost,
  };
}

type ActivityAction =
  | "PRODUCT_ADDED"
  | "PRODUCT_EDITED"
  | "PRODUCT_REMOVED"
  | "PRICE_CHANGED"
  | "COST_CHANGED"
  | "INVENTORY_CHANGED";

export async function logActivity(params: {
  userId: number;
  productId: number | null;
  productName: string;
  action: ActivityAction;
  previousValue?: string | null;
  newValue?: string | null;
}) {
  await db.insert(activities).values({
    userId: params.userId,
    productId: params.productId,
    productName: params.productName,
    action: params.action,
    previousValue: params.previousValue ?? null,
    newValue: params.newValue ?? null,
  });
}

export async function listActivities(limit = 100) {
  const rows = await db
    .select({
      id: activities.id,
      action: activities.action,
      productName: activities.productName,
      previousValue: activities.previousValue,
      newValue: activities.newValue,
      createdAt: activities.createdAt,
      userName: users.name,
    })
    .from(activities)
    .leftJoin(users, eq(activities.userId, users.id))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
  return rows;
}

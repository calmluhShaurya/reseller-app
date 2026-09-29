export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function getStockStatus(stock: number, threshold: number): StockStatus {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function stockStatusLabel(status: StockStatus): string {
  switch (status) {
    case "IN_STOCK":
      return "In Stock";
    case "LOW_STOCK":
      return "Low Stock";
    case "OUT_OF_STOCK":
      return "Out of Stock";
  }
}

export function formatCurrency(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today, ${time}`;

  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }) + `, ${time}`
  );
}

export function slugifySku(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "-");
}

export const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Accessories",
  "Home",
  "Other",
];

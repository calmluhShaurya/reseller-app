import { getStockStatus, stockStatusLabel } from "@/lib/utils";

export default function StatusBadge({
  stock,
  threshold,
}: {
  stock: number;
  threshold: number;
}) {
  const status = getStockStatus(stock, threshold);
  const styles = {
    IN_STOCK: "text-[var(--status-in)] bg-[var(--status-in-bg)]",
    LOW_STOCK: "text-[var(--status-low)] bg-[var(--status-low-bg)]",
    OUT_OF_STOCK: "text-[var(--status-out)] bg-[var(--status-out-bg)]",
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {stockStatusLabel(status)}
    </span>
  );
}

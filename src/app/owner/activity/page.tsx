import Nav from "@/components/Nav";
import { listActivities } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  PRODUCT_ADDED: "Product Added",
  PRODUCT_EDITED: "Product Edited",
  PRODUCT_REMOVED: "Product Removed",
  PRICE_CHANGED: "Price Changed",
  COST_CHANGED: "Purchase Price Changed",
  INVENTORY_CHANGED: "Inventory Updated",
};

const ACTION_DOT: Record<string, string> = {
  PRODUCT_ADDED: "bg-[var(--status-in)]",
  PRODUCT_EDITED: "bg-accent",
  PRODUCT_REMOVED: "bg-[var(--status-out)]",
  PRICE_CHANGED: "bg-[var(--status-low)]",
  COST_CHANGED: "bg-[var(--status-low)]",
  INVENTORY_CHANGED: "bg-accent",
};

export default async function ActivityPage() {
  const activities = await listActivities(150);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight">Activity History</h1>
        <p className="mt-1 text-sm text-muted">
          A record of product, price, and inventory changes.
        </p>

        {activities.length === 0 ? (
          <div className="mt-6 rounded border border-border bg-surface p-10 text-center text-sm text-muted">
            No activity yet.
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border rounded border border-border bg-surface">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3.5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    ACTION_DOT[a.action] ?? "bg-muted"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {ACTION_LABEL[a.action] ?? a.action}
                  </div>
                  <div className="text-sm text-muted">{a.productName}</div>
                  {(a.previousValue || a.newValue) && (
                    <div className="mt-0.5 text-sm">
                      {a.previousValue && (
                        <span className="text-muted">{a.previousValue}</span>
                      )}
                      {a.previousValue && a.newValue && (
                        <span className="mx-1.5 text-muted">→</span>
                      )}
                      {a.newValue && <span className="font-medium">{a.newValue}</span>}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs text-muted">
                    {formatDateTime(a.createdAt)}
                  </div>
                  {a.userName && (
                    <div className="text-xs text-muted">{a.userName}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

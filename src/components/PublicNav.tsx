import Link from "next/link";

export default function PublicNav() {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/products" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-[11px] font-semibold text-accent-foreground">
              CS
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Canton Supply Co.
            </span>
          </Link>

          <Link
            href="/login"
            className="rounded border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-[var(--background)]"
          >
            Owner Login
          </Link>
        </div>
      </div>
    </header>
  );
}

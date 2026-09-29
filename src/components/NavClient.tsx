"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionPayload } from "@/lib/auth";

export default function NavClient({
  session,
  links,
}: {
  session: SessionPayload;
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-[11px] font-semibold text-accent-foreground">
                CS
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                Canton Supply Co.
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/products" && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[var(--background)] text-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">{session.name}</div>
              <div className="text-xs text-muted">Owner</div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-[var(--background)]"
              >
                Log out
              </button>
            </form>
          </div>

          <button
            className="md:hidden rounded p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded px-2 py-2 text-sm font-medium text-foreground hover:bg-[var(--background)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-border mt-2 pt-3 px-2">
              <div className="leading-tight">
                <div className="text-sm font-medium">{session.name}</div>
                <div className="text-xs text-muted">Owner</div>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded border border-border px-3 py-1.5 text-sm font-medium"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionResult } from "@/lib/actions/auth";
import SubmitButton from "@/components/SubmitButton";

const initialState: ActionResult = {};

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent text-sm font-semibold text-accent-foreground">
            CS
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Canton Supply Co.</h1>
          <p className="text-sm text-muted">Set up the owner account</p>
        </div>

        <form action={formAction} className="rounded border border-border bg-surface p-6 space-y-4">
          {state?.error && (
            <div className="rounded border border-[var(--status-out)] bg-[var(--status-out-bg)] px-3 py-2 text-sm text-[var(--status-out)]">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Jamie Chen"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="At least 6 characters"
            />
          </div>

          <SubmitButton className="w-full" pendingLabel="Creating account…">
            Create owner account
          </SubmitButton>

          <p className="text-xs text-muted">
            This creates the one Owner account for this store. Once it
            exists, this setup page is disabled — sign in at{" "}
            <Link href="/login" className="underline underline-offset-2">
              /login
            </Link>{" "}
            instead.
          </p>
        </form>
      </div>
    </div>
  );
}

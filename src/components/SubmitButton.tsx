"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingLabel,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();

  const base =
    "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-accent text-accent-foreground hover:opacity-90",
    secondary: "border border-border bg-surface hover:bg-[var(--background)]",
    danger: "bg-[var(--status-out)] text-white hover:opacity-90",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {pending && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {pending ? pendingLabel ?? "Working…" : children}
    </button>
  );
}

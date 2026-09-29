"use client";

import { useActionState } from "react";
import { updateNameAction, type ActionResult } from "@/lib/actions/auth";
import SubmitButton from "@/components/SubmitButton";

const initialState: ActionResult = {};

export default function SettingsForm({ defaultName }: { defaultName: string }) {
  const [state, formAction] = useActionState(updateNameAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium sr-only">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaultName}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <SubmitButton variant="secondary" pendingLabel="Saving…">
        Save
      </SubmitButton>
      {state?.error && (
        <p className="text-sm text-[var(--status-out)]">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-[var(--status-in)]">{state.success}</p>
      )}
    </form>
  );
}

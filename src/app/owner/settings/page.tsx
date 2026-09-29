import Nav from "@/components/Nav";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your owner account.</p>

        <div className="mt-6 rounded border border-border bg-surface p-5">
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-medium">{session.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="font-medium">Owner</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Display name</h2>
          <SettingsForm defaultName={session.name} />
        </div>
      </main>
    </div>
  );
}

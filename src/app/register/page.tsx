import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const anyUser = await db.select({ id: users.id }).from(users).limit(1);
  if (anyUser.length > 0) {
    redirect("/login");
  }

  return <RegisterForm />;
}

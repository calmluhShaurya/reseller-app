"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  clearSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type ActionResult = { error?: string; success?: string };

export async function registerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  // This app has exactly one account tier: the Owner. Registration only
  // ever bootstraps that first account — once it exists, this action
  // refuses to create any more, regardless of what the client sends.
  const anyUser = await db.select({ id: users.id }).from(users).limit(1);
  if (anyUser.length > 0) {
    return {
      error: "An owner account already exists. Sign in instead.",
    };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  const [created] = await db
    .insert(users)
    .values({ name, email: email.toLowerCase(), passwordHash, role: "OWNER" })
    .returning();

  const token = await createSessionToken({
    userId: created.id,
    email: created.email,
    name: created.name,
    role: created.role,
  });
  await setSessionCookie(token);

  redirect("/owner");
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  const user = rows[0];

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);

  redirect("/owner");
}

const nameSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
});

export async function updateNameAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionForUpdate();
  if (!session) return { error: "You must be signed in." };

  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(users)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(users.id, session.userId));

  const token = await createSessionToken({
    ...session,
    name: parsed.data.name,
  });
  await setSessionCookie(token);

  return { success: "Name updated." };
}

async function getSessionForUpdate() {
  const { getSession } = await import("@/lib/auth");
  return getSession();
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

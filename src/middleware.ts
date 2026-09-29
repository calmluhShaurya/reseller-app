import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "insecure-dev-secret"
);

// Only the owner console requires a session. The catalog is public.
const OWNER_PREFIXES = ["/owner"];
const AUTH_PAGES = ["/login", "/register"];

async function getRole(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;
  const role = await getRole(token);

  const isOwnerRoute = OWNER_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isOwnerRoute && role !== "OWNER") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && role === "OWNER") {
    const url = req.nextUrl.clone();
    url.pathname = "/owner";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/login", "/register"],
};

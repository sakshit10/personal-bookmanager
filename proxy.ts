import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/auth";

const PROTECTED_PATHS = ["/dashboard"];
const AUTH_PATHS = ["/login", "/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};

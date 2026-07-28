import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/config/app.config";
import {
  canAccessPath,
  getDefaultRedirectForRole,
} from "@/lib/auth/access-control";
import type { UserRole } from "@/shared/types/roles";

/** Map session cookie user id to role for route guard (middleware-safe, no DB). */
const SESSION_ROLE_MAP: Record<string, UserRole> = {
  "user-owner-001": "farm_owner",
  "user-admin-001": "admin",
};

function getRoleFromSessionCookie(sessionValue: string | undefined): UserRole | null {
  if (!sessionValue) {
    return null;
  }
  return SESSION_ROLE_MAP[sessionValue] ?? null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const role = getRoleFromSessionCookie(sessionValue);

  if (pathname === "/") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname === "/login" && role) {
    return NextResponse.redirect(new URL(getDefaultRedirectForRole(role), request.url));
  }

  if (!canAccessPath(role, pathname)) {
    if (!role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL(getDefaultRedirectForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_ROLE_COOKIE_NAME,
} from "@/lib/config/app.config";
import {
  canAccessPath,
  getDefaultRedirectForRole,
} from "@/lib/auth/access-control";
import { refreshSupabaseSession } from "@/lib/supabase/proxy-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { UserRole } from "@/shared/types/roles";

/** Map session cookie user id to role for route guard (seed demo accounts). */
const SESSION_ROLE_MAP: Record<string, UserRole> = {
  "user-owner-001": "farm_owner",
  "user-admin-001": "admin",
};

function parseRoleCookie(value: string | undefined): UserRole | null {
  if (value === "admin" || value === "farm_owner") {
    return value;
  }
  return null;
}

function getRoleFromRequest(request: NextRequest): UserRole | null {
  const roleFromCookie = parseRoleCookie(request.cookies.get(SESSION_ROLE_COOKIE_NAME)?.value);
  if (roleFromCookie) {
    return roleFromCookie;
  }
  const sessionValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionValue) {
    return null;
  }
  return SESSION_ROLE_MAP[sessionValue] ?? null;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (isSupabaseConfigured()) {
    response = await refreshSupabaseSession(request, response);
  }

  const { pathname } = request.nextUrl;
  const role = getRoleFromRequest(request);

  if (pathname === "/") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (role === "farm_owner") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
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

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

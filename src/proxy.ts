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

function hasSessionEvidence(request: NextRequest): boolean {
  if (request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    return true;
  }
  if (isSupabaseConfigured()) {
    return request.cookies.getAll().some((cookie) => cookie.name.includes("-auth-token"));
  }
  return false;
}

function hasSupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.includes("-auth-token"));
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(SESSION_ROLE_COOKIE_NAME);
}

function redirectToLogin(request: NextRequest, pathname: string, error?: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  loginUrl.searchParams.set("clear", "1");
  if (error) {
    loginUrl.searchParams.set("error", error);
  }
  const response = NextResponse.redirect(loginUrl);
  clearSessionCookies(response);
  return response;
}

function shouldSkipLoginAutoRedirect(request: NextRequest): boolean {
  const { searchParams } = request.nextUrl;
  return searchParams.has("error") || searchParams.has("clear");
}

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith("/app") || pathname.startsWith("/admin");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const role = getRoleFromRequest(request);
  const sessionEvidence = hasSessionEvidence(request);

  // Chỉ refresh Supabase khi có cookie auth và route cần bảo vệ — không gọi mọi request.
  if (
    isSupabaseConfigured() &&
    isProtectedPath(pathname) &&
    hasSupabaseAuthCookies(request)
  ) {
    response = await refreshSupabaseSession(request, response);
  }

  if (role && !sessionEvidence && isProtectedPath(pathname)) {
    return redirectToLogin(request, pathname);
  }

  if (pathname === "/") {
    if (role === "admin" && sessionEvidence) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Không tự redirect khỏi /login khi cần xóa session hoặc có lỗi
  if (pathname === "/login") {
    if (shouldSkipLoginAutoRedirect(request)) {
      const cleared = NextResponse.next({ request });
      clearSessionCookies(cleared);
      return cleared;
    }
    if (role && sessionEvidence) {
      return NextResponse.redirect(new URL(getDefaultRedirectForRole(role), request.url));
    }
  }

  if (!canAccessPath(role, pathname)) {
    if (!role) {
      return redirectToLogin(request, pathname);
    }
    return NextResponse.redirect(new URL(getDefaultRedirectForRole(role), request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

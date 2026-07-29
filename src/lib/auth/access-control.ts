import type { UserRole } from "@/shared/types/roles";

const PUBLIC_PATHS = ["/login"];

export function canAccessPath(role: UserRole | null, pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname === "/") {
    return true;
  }
  /** API routes enforce auth themselves; avoid HTML redirects that break `fetch().json()`. */
  if (pathname.startsWith("/api/")) {
    return true;
  }
  if (pathname.startsWith("/admin")) {
    return role === "admin";
  }
  if (pathname.startsWith("/app")) {
    return role === null || role === "farm_owner";
  }
  if (!role) {
    return false;
  }
  return false;
}

export function getDefaultRedirectForRole(role: UserRole): string {
  return role === "admin" ? "/admin" : "/app";
}

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_FARM_ID, SESSION_COOKIE_NAME } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { resolveSupabaseSessionUser } from "@/lib/auth/supabase-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SessionUser } from "@/shared/types/roles";
import { authService } from "@/features/auth/services/auth.service";

const GUEST_SESSION: SessionUser = {
  userId: "guest",
  email: "",
  fullName: "Khách truy cập",
  role: "farm_owner",
  farmId: DEFAULT_FARM_ID,
};

export type FarmContext = {
  userId: string;
  role: SessionUser["role"];
  farmId: string;
  isGuest: boolean;
};

export type AppSession = SessionUser & { isGuest: boolean };

async function resolveSeedSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) {
    return null;
  }
  try {
    const user = await authService.getUserById(sessionId);
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      farmId: user.farmId,
    };
  } catch {
    return null;
  }
}

/** Một lần resolve session trong cùng request (React cache). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (isSupabaseConfigured()) {
    return resolveSupabaseSessionUser();
  }
  return resolveSeedSessionUser();
});

/** Redirect sang login — xóa cookie do proxy xử lý (không sửa cookie trong Server Component). */
export function redirectToLogin(reason?: "unauthorized" | "no-farm", redirectPath?: string): never {
  const params = new URLSearchParams();
  params.set("clear", "1");
  if (reason === "no-farm") {
    params.set("error", "no-farm");
  }
  if (reason === "unauthorized") {
    params.set("error", "session");
  }
  if (redirectPath) {
    params.set("redirect", redirectPath);
  }
  redirect(`/login?${params.toString()}`);
  throw new Error("redirect");
}

export type FarmOwnerSession = SessionUser & { role: "farm_owner"; farmId: string };

/** Kiểm tra session farm owner một lần; thất bại → /login (không lặp). */
export async function getFarmSessionOrRedirect(): Promise<FarmOwnerSession> {
  const session = await getSessionUser();
  if (!session) {
    redirectToLogin("unauthorized", "/app");
  }
  if (session.role !== "farm_owner" || !session.farmId) {
    redirectToLogin("no-farm");
  }
  return session as FarmOwnerSession;
}

export async function getAdminSessionOrRedirect(): Promise<SessionUser & { role: "admin" }> {
  const session = await getSessionUser();
  if (!session) {
    redirectToLogin("unauthorized", "/admin");
  }
  if (session.role !== "admin") {
    redirectToLogin("unauthorized");
  }
  return session as SessionUser & { role: "admin" };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new AppError("UNAUTHORIZED");
  }
  return session;
}

/** Farm app session: logged-in user or demo guest (seed data, no login). */
export async function resolveAppSession(): Promise<AppSession> {
  const session = await getSessionUser();
  if (session) {
    return { ...session, isGuest: false };
  }
  return { ...GUEST_SESSION, isGuest: true };
}

export async function requireFarmContext(): Promise<FarmContext> {
  const session = await resolveAppSession();
  if (session.role !== "farm_owner" || !session.farmId) {
    throw new AppError("FORBIDDEN", "Tài khoản chưa được gán trang trại. Liên hệ quản trị viên.");
  }
  return {
    userId: session.userId,
    role: session.role,
    farmId: session.farmId,
    isGuest: session.isGuest,
  };
}

export async function requireAuthenticatedFarmContext(): Promise<
  Omit<FarmContext, "isGuest"> & { isGuest: false }
> {
  const ctx = await requireFarmContext();
  if (ctx.isGuest) {
    throw new AppError("UNAUTHORIZED");
  }
  return { userId: ctx.userId, role: ctx.role, farmId: ctx.farmId, isGuest: false };
}

export async function requireAdminContext(): Promise<{
  userId: string;
  role: "admin";
}> {
  const session = await getSessionUser();
  if (!session) {
    throw new AppError("UNAUTHORIZED");
  }
  if (session.role !== "admin") {
    throw new AppError("FORBIDDEN");
  }
  return { userId: session.userId, role: "admin" };
}

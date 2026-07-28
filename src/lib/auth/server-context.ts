import { cookies } from "next/headers";
import { DEFAULT_FARM_ID, SESSION_COOKIE_NAME } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
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

export async function getSessionUser(): Promise<SessionUser | null> {
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

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new AppError("UNAUTHORIZED");
  }
  return session;
}

/** Farm app session: logged-in user or demo guest (seed data, no login). */
export async function resolveAppSession(): Promise<SessionUser & { isGuest: boolean }> {
  const session = await getSessionUser();
  if (session) {
    return { ...session, isGuest: false };
  }
  return { ...GUEST_SESSION, isGuest: true };
}

export async function requireFarmContext(): Promise<FarmContext> {
  const session = await resolveAppSession();
  if (session.role !== "farm_owner" || !session.farmId) {
    throw new AppError("FORBIDDEN");
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
  const session = await requireSession();
  if (session.role !== "admin") {
    throw new AppError("FORBIDDEN");
  }
  return { userId: session.userId, role: "admin" };
}

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { getSessionUserFromSupabase } from "@/lib/auth/supabase-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SessionUser } from "@/shared/types/roles";
import { authService } from "@/features/auth/services/auth.service";

export type FarmContext = {
  userId: string;
  role: SessionUser["role"];
  farmId: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabaseSession = await getSessionUserFromSupabase();
    if (supabaseSession) {
      return supabaseSession;
    }
  }

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

/** App session — bắt buộc đăng nhập, không có chế độ guest/demo. */
export async function resolveAppSession(): Promise<SessionUser> {
  return requireSession();
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
  };
}

export async function requireAuthenticatedFarmContext(): Promise<FarmContext> {
  return requireFarmContext();
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

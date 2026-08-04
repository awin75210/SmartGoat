import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_ROLE_COOKIE_NAME } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SessionUser, UserRole } from "@/shared/types/roles";
import type { LoginInput } from "@/features/auth/types/auth.types";

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  role: UserRole;
  farm_id: string | null;
};

function mapProfileToSession(userId: string, authEmail: string | undefined, profile: ProfileRow): SessionUser {
  const role = profile.role;
  return {
    userId,
    email: profile.email ?? authEmail ?? "",
    fullName: profile.full_name ?? "Người dùng",
    role,
    farmId: profile.farm_id ?? null,
  };
}

export async function getSessionUserFromSupabase(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name, role, farm_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    return mapProfileToSession(user.id, user.email, profile as ProfileRow);
  } catch {
    return null;
  }
}

export async function signInWithSupabase(input: LoginInput): Promise<SessionUser> {
  if (!isSupabaseConfigured()) {
    throw new AppError("INTERNAL_ERROR");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email not confirmed") || msg.includes("confirm")) {
      throw new AppError("VALIDATION_ERROR", "Email chưa được xác nhận. Kiểm tra hộp thư hoặc tắt xác nhận email trên Supabase.");
    }
    if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
      throw new AppError("UNAUTHORIZED");
    }
    throw new AppError("UNAUTHORIZED");
  }

  if (!data.user) {
    throw new AppError("UNAUTHORIZED");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, full_name, role, farm_id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    throw new AppError("INTERNAL_ERROR");
  }

  if (!profile) {
    throw new AppError(
      "FORBIDDEN",
      "Tài khoản chưa có hồ sơ (profiles). Liên hệ quản trị viên để gán role và farm_id.",
    );
  }

  return mapProfileToSession(data.user.id, data.user.email, profile as ProfileRow);
}

export async function signOutSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

export async function setAppSessionCookies(session: SessionUser, rememberMe: boolean): Promise<void> {
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  const base = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge };
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.userId, base);
  cookieStore.set(SESSION_ROLE_COOKIE_NAME, session.role, base);
}

export async function clearAppSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(SESSION_ROLE_COOKIE_NAME);
}

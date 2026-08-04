import { AppError } from "@/lib/errors/app-error";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SessionUser } from "@/shared/types/roles";

export type ChatApiAuthContext = {
  userId: string;
  farmId: string;
  role: SessionUser["role"];
  authMode: "supabase" | "session";
};

async function resolveSupabaseChatAuth(): Promise<ChatApiAuthContext | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

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
    .select("role, farm_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new AppError("INTERNAL_ERROR");
  }

  const role = (profile?.role as SessionUser["role"] | undefined) ?? "farm_owner";
  const farmId = profile?.farm_id ?? null;

  if (role === "admin") {
    throw new AppError("FORBIDDEN");
  }

  if (!farmId) {
    throw new AppError("FORBIDDEN", "Tài khoản chưa được gán trang trại");
  }

  return {
    userId: user.id,
    farmId,
    role,
    authMode: "supabase",
  };
}

/** Chat API — bắt buộc đăng nhập, không hỗ trợ guest. */
export async function resolveChatApiAuth(): Promise<ChatApiAuthContext> {
  const supabaseCtx = await resolveSupabaseChatAuth();
  if (supabaseCtx) {
    return supabaseCtx;
  }

  const ctx = await requireAuthenticatedFarmContext();
  return {
    userId: ctx.userId,
    farmId: ctx.farmId,
    role: ctx.role,
    authMode: "session",
  };
}

export function getChatRateLimitKey(request: Request, auth: ChatApiAuthContext): string {
  return `ai-chat:${auth.userId}`;
}

import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { requireAuthenticatedFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SessionUser } from "@/shared/types/roles";

export type ChatApiAuthContext = {
  userId: string;
  farmId: string;
  role: SessionUser["role"] | "guest";
  authMode: "supabase" | "session" | "guest";
  isGuest: boolean;
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
  let farmId = profile?.farm_id ?? null;
  if (role === "farm_owner" && !farmId) {
    farmId = DEFAULT_FARM_ID;
  }

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
    isGuest: false,
  };
}

function resolveGuestChatAuth(): ChatApiAuthContext {
  return {
    userId: "guest",
    farmId: DEFAULT_FARM_ID,
    role: "guest",
    authMode: "guest",
    isGuest: true,
  };
}

/** Chat POST: authenticated user or guest (no persisted history). */
export async function resolveChatApiAuthOrGuest(): Promise<ChatApiAuthContext> {
  const supabaseCtx = await resolveSupabaseChatAuth();
  if (supabaseCtx) {
    return supabaseCtx;
  }

  try {
    const ctx = await requireAuthenticatedFarmContext();
    return {
      userId: ctx.userId,
      farmId: ctx.farmId,
      role: ctx.role,
      authMode: "session",
      isGuest: false,
    };
  } catch (error) {
    if (error instanceof AppError && error.code === "UNAUTHORIZED") {
      const session = await resolveAppSession();
      if (session.isGuest) {
        return resolveGuestChatAuth();
      }
    }
    throw error;
  }
}

/** Chat history APIs: authenticated users only. */
export async function resolveChatApiAuth(): Promise<ChatApiAuthContext> {
  const auth = await resolveChatApiAuthOrGuest();
  if (auth.isGuest) {
    throw new AppError("UNAUTHORIZED");
  }
  return auth;
}

export function getChatRateLimitKey(request: Request, auth: ChatApiAuthContext): string {
  if (auth.isGuest) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    return `ai-chat:guest:${ip}`;
  }
  return `ai-chat:${auth.userId}`;
}

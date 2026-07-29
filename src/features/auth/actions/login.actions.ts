"use server";

import { getDefaultRedirectForRole } from "@/lib/auth/access-control";
import {
  clearAppSessionCookies,
  setAppSessionCookies,
  signOutSupabase,
} from "@/lib/auth/supabase-auth";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { loginSchema, type LoginSchemaInput } from "../schemas/login.schema";
import { authService } from "../services/auth.service";

export async function loginAction(
  input: LoginSchemaInput,
): Promise<ActionResult<{ redirectTo: string }>> {
  return toActionResult(async () => {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR");
    }
    const user = await authService.login(parsed.data);
    await setAppSessionCookies(
      {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        farmId: user.farmId,
      },
      Boolean(parsed.data.rememberMe),
    );
    return { redirectTo: getDefaultRedirectForRole(user.role) };
  });
}

export async function logoutAction(): Promise<ActionResult<{ redirectTo: string }>> {
  return toActionResult(async () => {
    await signOutSupabase();
    await clearAppSessionCookies();
    return { redirectTo: "/app" };
  });
}

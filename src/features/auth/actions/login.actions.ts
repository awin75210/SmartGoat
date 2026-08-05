"use server";

import { getDefaultRedirectForRole } from "@/lib/auth/access-control";
import {
  clearAppSessionCookies,
  setAppSessionCookies,
  signOutSupabase,
} from "@/lib/auth/supabase-auth";
import { actionFailure, actionSuccess, toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { loginSchema, type LoginSchemaInput } from "../schemas/login.schema";
import { authService } from "../services/auth.service";

export async function loginAction(
  input: LoginSchemaInput,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure("VALIDATION_ERROR");
  }

  let user;
  try {
    user = await authService.login(parsed.data);
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
  } catch (error) {
    if (error instanceof AppError) {
      const custom =
        error.message && error.message !== error.code ? error.message : undefined;
      return actionFailure(error.code, custom);
    }
    return actionFailure("INTERNAL_ERROR");
  }

  return actionSuccess({ redirectTo: getDefaultRedirectForRole(user.role) });
}

export async function logoutAction(): Promise<ActionResult<{ redirectTo: string }>> {
  return toActionResult(async () => {
    await signOutSupabase();
    await clearAppSessionCookies();
    return { redirectTo: "/login" };
  });
}

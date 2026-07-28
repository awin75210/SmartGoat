"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/config/app.config";
import { getDefaultRedirectForRole } from "@/lib/auth/access-control";
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
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: parsed.data.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    });
    return { redirectTo: getDefaultRedirectForRole(user.role) };
  });
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/app");
}

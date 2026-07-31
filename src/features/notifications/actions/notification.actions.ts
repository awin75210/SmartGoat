"use server";

import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { AppError } from "@/lib/errors/app-error";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { settingsService } from "@/features/settings/services/settings.service";
import { farmAlertEmailService } from "../services/farm-alert-email.service";

export async function sendTestAlertEmailAction(): Promise<
  ActionResult<{ message: string }>
> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const settings = await settingsService.getSettings(ctx.farmId);
    const result = await farmAlertEmailService.sendTestAlert(settings);
    if (!result.sent) {
      throw new AppError("INTERNAL_ERROR", result.message);
    }
    return { message: result.message };
  });
}

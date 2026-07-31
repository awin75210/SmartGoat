"use server";

import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { farmAlertEmailService } from "@/features/notifications/services/farm-alert-email.service";
import { updateSettingsSchema } from "../schemas/settings.schema";
import { settingsService } from "../services/settings.service";
import type { FarmSettings } from "../types/settings.types";

export type UpdateSettingsResult = {
  settings: FarmSettings;
  emailSent: boolean;
  emailMessage?: string;
};

export async function updateSettingsAction(
  input: unknown,
): Promise<ActionResult<UpdateSettingsResult>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = updateSettingsSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? undefined,
      );
    }

    const settings = await settingsService.updateSettings(
      ctx.farmId,
      parsed.data,
      new Date().toISOString(),
    );

    let emailSent = false;
    let emailMessage: string | undefined;

    if (settings.notifyEmail) {
      const emailResult = await farmAlertEmailService.sendSettingsConfirmation(settings);
      emailSent = emailResult.sent;
      emailMessage = emailResult.message;
    }

    return { settings, emailSent, emailMessage };
  });
}

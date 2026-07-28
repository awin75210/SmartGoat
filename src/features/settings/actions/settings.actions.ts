"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import { updateSettingsSchema } from "../schemas/settings.schema";
import { settingsService } from "../services/settings.service";
import type { FarmSettings } from "../types/settings.types";

export async function updateSettingsAction(
  input: unknown,
): Promise<ActionResult<FarmSettings>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = updateSettingsSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR");
    }
    const settings = await settingsService.updateSettings(
      ctx.farmId,
      parsed.data,
      SEED_REFERENCE_ISO,
    );
    revalidatePath("/app/settings");
    return settings;
  });
}

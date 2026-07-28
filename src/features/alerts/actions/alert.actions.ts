"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import { resolveAlertSchema } from "../schemas/resolve-alert.schema";
import { alertService } from "../services/alert.service";
import type { Alert } from "../types/alert.types";

export async function markAlertResolvedAction(
  input: unknown,
): Promise<ActionResult<Alert>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = resolveAlertSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR");
    }
    const alert = await alertService.markResolved(
      ctx.farmId,
      parsed.data.alertId,
      SEED_REFERENCE_ISO,
    );
    revalidatePath("/app/alerts");
    revalidatePath("/app/iot");
    revalidatePath("/app");
    return alert;
  });
}

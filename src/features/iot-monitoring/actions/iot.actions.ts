"use server";

import { requireFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { iotTimeRangeSchema } from "../schemas/iot-range.schema";
import { iotMonitoringService } from "../services/iot-monitoring.service";
import type { IotMonitoringSnapshot } from "../types/iot.types";

export async function fetchIotMonitoringAction(
  rangeInput: unknown,
): Promise<ActionResult<IotMonitoringSnapshot>> {
  return toActionResult(async () => {
    const ctx = await requireFarmContext();
    const parsed = iotTimeRangeSchema.safeParse(rangeInput);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR");
    }
    return iotMonitoringService.getMonitoringSnapshot(ctx.farmId, parsed.data);
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { iotControlService } from "../services/iot-control.service";
import type { IotActuatorState } from "../types/iot.types";

export async function setRelayAction(
  actuatorKey: string,
  isOn: boolean,
): Promise<ActionResult<{ commandId: string }>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    if (!actuatorKey.startsWith("relay_")) {
      throw new AppError("VALIDATION_ERROR", "Actuator không hợp lệ");
    }
    const result = await iotControlService.setRelay(ctx.farmId, actuatorKey, isOn);
    revalidatePath("/app/iot");
    return result;
  });
}

export async function setServoRoofAction(open: boolean): Promise<ActionResult<{ commandId: string }>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const result = await iotControlService.setServoRoof(ctx.farmId, open);
    revalidatePath("/app/iot");
    return result;
  });
}

export async function listActuatorsAction(): Promise<ActionResult<IotActuatorState[]>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    return iotControlService.listActuators(ctx.farmId);
  });
}

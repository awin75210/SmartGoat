"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { createBarnSchema, updateBarnSchema } from "../schemas/barn.schema";
import { barnService } from "../services/barn.service";
import type { Barn } from "../types/barn.types";

export async function createBarnAction(input: unknown): Promise<ActionResult<Barn>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = createBarnSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    }
    const barn = await barnService.createBarn(ctx.farmId, parsed.data);
    revalidatePath("/app/herd");
    revalidatePath("/app/herd/new");
    return barn;
  });
}

export async function updateBarnAction(
  barnId: string,
  input: unknown,
): Promise<ActionResult<Barn>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = updateBarnSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    }
    const barn = await barnService.updateBarn(ctx.farmId, barnId, parsed.data);
    revalidatePath("/app/herd");
    revalidatePath("/app/herd/new");
    return barn;
  });
}

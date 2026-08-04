"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { schemaPayloadToCreateInput } from "../mappers/goat-batch.mapper";
import { createGoatBatchSchema } from "../schemas/goat-batch.schema";
import { goatBatchService } from "../services/goat-batch.service";
import type { GoatBatch } from "../types/goat-batch.types";

export async function suggestBatchCodeAction(): Promise<ActionResult<{ batchCode: string }>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const batchCode = await goatBatchService.suggestBatchCode(ctx.farmId);
    return { batchCode };
  });
}

export async function createGoatBatchAction(input: unknown): Promise<ActionResult<GoatBatch>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = createGoatBatchSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    }
    const batchCode = await goatBatchService.suggestBatchCode(ctx.farmId);
    const createInput = schemaPayloadToCreateInput({
      ...parsed.data,
      birth_date: parsed.data.birth_date,
      batchCode,
    });
    const batch = await goatBatchService.createBatch(ctx.farmId, createInput);
    revalidatePath("/app/herd");
    revalidatePath("/app/herd/new");
    return batch;
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { createFarmSchema } from "../schemas/create-farm.schema";
import { adminService } from "../services/admin.service";
import type { CreateFarmResult } from "../types/admin.types";

export async function createFarmAction(input: unknown): Promise<ActionResult<CreateFarmResult>> {
  return toActionResult(async () => {
    await requireAdminContext();
    const parsed = createFarmSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", parsed.error.issues[0]?.message);
    }
    const result = await adminService.createFarmWithOwner(parsed.data);
    revalidatePath("/admin/farms");
    revalidatePath("/admin/users");
    return result;
  });
}

export async function deleteFarmAction(farmId: string): Promise<ActionResult<{ farmId: string }>> {
  return toActionResult(async () => {
    await requireAdminContext();
    if (!farmId.trim()) {
      throw new AppError("VALIDATION_ERROR", "Mã trang trại không hợp lệ");
    }
    await adminService.deleteFarm(farmId);
    revalidatePath("/admin/farms");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/farms/${farmId}`);
    return { farmId };
  });
}

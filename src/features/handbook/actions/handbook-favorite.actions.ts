"use server";

import { z } from "zod";
import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { AppError } from "@/lib/errors/app-error";
import { handbookFavoriteService } from "../services/handbook-favorite.service";

const toggleSchema = z.object({
  articleId: z.string().min(1),
});

export async function toggleHandbookFavoriteAction(
  input: unknown,
): Promise<ActionResult<{ favorited: boolean; articleId: string }>> {
  return toActionResult(async () => {
    const ctx = await requireAuthenticatedFarmContext();
    const parsed = toggleSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR");
    }

    const result = await handbookFavoriteService.toggleFavorite(ctx.userId, parsed.data.articleId);
    return { ...result, articleId: parsed.data.articleId };
  });
}

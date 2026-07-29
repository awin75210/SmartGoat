"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "@/lib/auth/server-context";
import { AppError } from "@/lib/errors/app-error";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import type { KnowledgeImportResult } from "../schemas/knowledge-import.schema";
import { knowledgeImportService } from "../services/knowledge-import.service";

const ACCEPTED_MIME = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
];

export async function importKnowledgeXlsxAction(
  formData: FormData,
): Promise<ActionResult<KnowledgeImportResult>> {
  return toActionResult(async () => {
    await requireAdminContext();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "Vui lòng chọn file Excel (.xlsx)");
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      throw new AppError("VALIDATION_ERROR", "Chỉ hỗ trợ file .xlsx");
    }

    if (file.type && !ACCEPTED_MIME.includes(file.type)) {
      throw new AppError("VALIDATION_ERROR", "Định dạng file không hợp lệ");
    }

    const buffer = await file.arrayBuffer();
    const result = await knowledgeImportService.importFromBuffer(buffer);
    revalidatePath("/admin/knowledge");
    return result;
  });
}

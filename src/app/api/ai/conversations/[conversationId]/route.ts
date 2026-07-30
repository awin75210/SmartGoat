import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveChatApiAuth } from "@/lib/auth/chat-api-auth";
import { AppError } from "@/lib/errors/app-error";
import { getErrorMessageVi } from "@/lib/errors/error-messages";
import { chatbotService } from "@/features/ai-chatbot/services/chatbot.service";

const paramsSchema = z.object({
  conversationId: z.uuid(),
});

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ conversationId: string }> },
) {
  try {
    const auth = await resolveChatApiAuth();
    const raw = await context.params;
    const parsed = paramsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_ERROR", message: getErrorMessageVi("VALIDATION_ERROR") },
        { status: 400 },
      );
    }

    await chatbotService.deleteConversation(auth.userId, auth.farmId, parsed.data.conversationId);
    return NextResponse.json({ ok: true, data: null });
  } catch (error) {
    if (error instanceof AppError) {
      const status =
        error.code === "UNAUTHORIZED" ? 401 : error.code === "FORBIDDEN" ? 403 : error.code === "NOT_FOUND" ? 404 : 500;
      return NextResponse.json(
        { ok: false, code: error.code, message: getErrorMessageVi(error.code) },
        { status },
      );
    }
    console.error("[ai-chat] delete conversation failed", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", message: getErrorMessageVi("INTERNAL_ERROR") },
      { status: 500 },
    );
  }
}

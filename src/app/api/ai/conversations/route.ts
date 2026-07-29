import { NextResponse } from "next/server";
import { resolveChatApiAuth } from "@/lib/auth/chat-api-auth";
import { AppError } from "@/lib/errors/app-error";
import { getErrorMessageVi } from "@/lib/errors/error-messages";
import { chatbotService } from "@/features/ai-chatbot/services/chatbot.service";

export async function GET() {
  try {
    const auth = await resolveChatApiAuth();
    const conversations = await chatbotService.listConversations(auth.userId, auth.farmId);
    return NextResponse.json({ ok: true, data: conversations });
  } catch (error) {
    if (error instanceof AppError) {
      const status = error.code === "UNAUTHORIZED" ? 401 : error.code === "FORBIDDEN" ? 403 : 500;
      return NextResponse.json(
        { ok: false, code: error.code, message: getErrorMessageVi(error.code) },
        { status },
      );
    }
    console.error("[ai-chat] list conversations failed", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", message: getErrorMessageVi("INTERNAL_ERROR") },
      { status: 500 },
    );
  }
}

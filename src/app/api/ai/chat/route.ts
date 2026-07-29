import { NextResponse } from "next/server";
import { resolveChatApiAuth } from "@/lib/auth/chat-api-auth";
import { AppError } from "@/lib/errors/app-error";
import { getErrorMessageVi } from "@/lib/errors/error-messages";
import { checkRateLimit } from "@/lib/rate-limit/memory-rate-limit";
import { chatRequestSchema } from "@/features/ai-chatbot/schemas/chatbot.schema";
import { chatbotService } from "@/features/ai-chatbot/services/chatbot.service";

const RATE_MAX = 20;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  try {
    const auth = await resolveChatApiAuth();

    const rate = checkRateLimit(`ai-chat:${auth.userId}`, RATE_MAX, RATE_WINDOW_MS);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, code: "RATE_LIMITED", message: "Bạn gửi câu hỏi quá nhanh. Vui lòng thử lại sau." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
      );
    }

    const body: unknown = await request.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? getErrorMessageVi("VALIDATION_ERROR"),
        },
        { status: 400 },
      );
    }

    const result = await chatbotService.handleUserMessage({
      userId: auth.userId,
      farmId: auth.farmId,
      message: parsed.data.message,
      conversationId: parsed.data.conversationId,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof AppError) {
      const status = error.code === "UNAUTHORIZED" ? 401 : error.code === "FORBIDDEN" ? 403 : 500;
      return NextResponse.json(
        { ok: false, code: error.code, message: getErrorMessageVi(error.code) },
        { status },
      );
    }
    console.error("[ai-chat] unexpected error", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", message: getErrorMessageVi("INTERNAL_ERROR") },
      { status: 500 },
    );
  }
}

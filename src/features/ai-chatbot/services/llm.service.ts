import { getAiApiBaseUrl, getAiApiKey, getAiModel } from "@/lib/supabase/env";
import type { QueryIntent } from "./query-intent.service";

export type LlmCompletionInput = {
  systemPrompt: string;
  knowledgeBlock: string;
  farmBlock: string;
  userQuestion: string;
  intent: QueryIntent;
};

function buildFallbackReply(input: LlmCompletionInput): string {
  const hasKnowledge =
    !input.knowledgeBlock.includes("(không có mục phù hợp)") &&
    input.knowledgeBlock.includes("KNOWLEDGE_CONTEXT");

  if (!hasKnowledge) {
    return (
      "Hiện tôi chưa tìm thấy kiến thức phù hợp trong hệ thống để trả lời chính xác câu hỏi của bạn. " +
      "Bạn có thể mô tả thêm triệu chứng, tuổi dê, khẩu phần hoặc điều kiện chuồng để tôi hỗ trợ tốt hơn."
    );
  }

  const lines = input.knowledgeBlock
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("==="))
    .slice(0, 6);

  let reply =
    "Dựa trên tài liệu tham khảo trong CapraCare, bạn có thể cân nhắc các điểm sau:\n\n" +
    lines.map((l) => `• ${l.trim()}`).join("\n");

  if (input.farmBlock.includes("FARM_DATA") && !input.farmBlock.includes("(không có")) {
    reply += "\n\nSố liệu trang trại liên quan:\n" + input.farmBlock.replace(/===.*?===\n?/g, "").trim();
  }

  if (input.intent.isHealthRelated) {
    reply +=
      "\n\nLưu ý: Thông tin chỉ mang tính tham khảo, không thay thế chẩn đoán và điều trị của bác sĩ thú y.";
  }

  return reply;
}

export async function generateAssistantReply(input: LlmCompletionInput): Promise<string> {
  const apiKey = getAiApiKey();
  if (!apiKey) {
    return buildFallbackReply(input);
  }

  const userContent = [input.knowledgeBlock, input.farmBlock, `=== USER_QUESTION ===\n${input.userQuestion}`].join(
    "\n\n",
  );

  try {
    const res = await fetch(`${getAiApiBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getAiModel(),
        temperature: 0.4,
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[ai-chat] LLM request failed", res.status);
      return buildFallbackReply(input);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return buildFallbackReply(input);
    }
    return text;
  } catch (err) {
    console.error("[ai-chat] LLM error", err instanceof Error ? err.message : "unknown");
    return buildFallbackReply(input);
  }
}

import { getAiApiBaseUrl, getAiApiKey, getAiModel } from "@/lib/supabase/env";
import {
  isSmallTalkQuery,
  pickBestFaqForQuestion,
} from "../utils/knowledge-retrieval.utils";
import type { QueryIntent } from "./query-intent.service";

export type LlmCompletionInput = {
  systemPrompt: string;
  knowledgeBlock: string;
  farmBlock: string;
  userQuestion: string;
  intent: QueryIntent;
};

function parseFaqsFromKnowledgeBlock(block: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const chunks = block.split(/\n\n+/);
  for (const chunk of chunks) {
    const qMatch = chunk.match(/Hỏi:\s*(.+)/);
    const aMatch = chunk.match(/Gợi ý nội dung:\s*([\s\S]+)/);
    if (qMatch && aMatch) {
      faqs.push({
        question: qMatch[1].trim(),
        answer: aMatch[1].trim(),
      });
    }
  }
  return faqs;
}

function buildFallbackReply(input: LlmCompletionInput): string {
  const question = input.userQuestion.trim();

  if (isSmallTalkQuery(question)) {
    return (
      "Xin chào! Tôi là CapraCare AI, hỗ trợ tư vấn chăn nuôi dê. " +
      "Bạn có thể hỏi về khẩu phần, bệnh thường gặp (tiêu chảy, ho sốt…), chăm dê con theo tuổi, hoặc môi trường chuồng."
    );
  }

  const hasKnowledge =
    !input.knowledgeBlock.includes("(không có mục phù hợp)") &&
    input.knowledgeBlock.includes("KNOWLEDGE_CONTEXT");

  if (!hasKnowledge) {
    return (
      `Về câu hỏi 「${question}」, hiện tôi chưa tìm thấy tài liệu phù hợp trong hệ thống. ` +
      "Bạn mô tả thêm (tuổi dê, triệu chứng, khẩu phần, tình trạng chuồng) hoặc tra Sổ tay điện tử theo danh mục Bệnh / Dinh dưỡng / Dê con."
    );
  }

  const faqs = parseFaqsFromKnowledgeBlock(input.knowledgeBlock);
  const bestFaq = pickBestFaqForQuestion(faqs, question);

  let reply = `Về câu hỏi của bạn: 「${question}」\n\n`;

  if (bestFaq) {
    reply += bestFaq.answer;
  } else {
    const articleChunk = input.knowledgeBlock
      .split("=== KNOWLEDGE_CONTEXT (bài viết) ===")[1]
      ?.split("=== KNOWLEDGE_CONTEXT (FAQ")[0]
      ?.trim();
    if (articleChunk) {
      const firstArticle = articleChunk.split(/\n\n+/)[0]?.replace(/^\[[^\]]+\]\s*/, "");
      const summaryLine = firstArticle?.split("\n").slice(0, 3).join(" ").trim();
      if (summaryLine) {
        reply += summaryLine;
      }
    }
  }

  if (!bestFaq && reply.endsWith("」\n\n")) {
    reply +=
      "Tôi tìm thấy tài liệu liên quan nhưng chưa đủ chi tiết cho câu hỏi cụ thể. Hãy diễn đạt lại hoặc bổ sung triệu chứng / giai đoạn nuôi.";
  }

  if (input.farmBlock.includes("FARM_DATA") && !input.farmBlock.includes("(không có")) {
    reply += `\n\nThông tin trang trại (nếu liên quan):\n${input.farmBlock.replace(/===.*?===\n?/g, "").trim()}`;
  }

  if (input.intent.isHealthRelated) {
    reply +=
      "\n\nLưu ý: Thông tin chỉ tham khảo, không thay thế bác sĩ thú y. Gọi thú y sớm nếu dê yếu, sốt cao, không uống hoặc phân có máu.";
  }

  return reply.trim();
}

export async function generateAssistantReply(input: LlmCompletionInput): Promise<string> {
  const apiKey = getAiApiKey();
  if (!apiKey) {
    return buildFallbackReply(input);
  }

  const userContent = [
    input.knowledgeBlock,
    input.farmBlock,
    `=== USER_QUESTION ===\n${input.userQuestion}`,
    "Hãy trả lời trực tiếp USER_QUESTION ở đoạn đầu; chỉ dùng KNOWLEDGE_CONTEXT và FARM_DATA; không lệch sang chủ đề không liên quan.",
  ].join("\n\n");

  try {
    const res = await fetch(`${getAiApiBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getAiModel(),
        temperature: 0.35,
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

import { randomUUID } from "crypto";
import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { AppError } from "@/lib/errors/app-error";
import { CHAT_SUGGESTED_PROMPTS_SEED } from "../data/knowledge.seed";
import {
  buildFarmDataBlock,
  buildKnowledgeContextBlock,
  CHATBOT_SYSTEM_PROMPT,
} from "../prompts/chatbot.prompts";
import { createChatRepository } from "../repositories/create-chat.repository";
import { createKnowledgeRepository } from "../repositories/create-knowledge.repository";
import { markKnowledgeSourcesUsed } from "../repositories/seed-knowledge.repository";
import type { ChatApiResponse, ChatMessage, ChatSourceRef, RetrievedKnowledge } from "../types/chatbot.types";
import { buildFarmContextSnippet } from "./farm-context.service";
import { generateAssistantReply, type LlmHistoryTurn } from "./llm.service";
import { detectQueryIntent } from "./query-intent.service";

const RETRIEVAL_LIMIT = 5;

function buildSources(articles: RetrievedKnowledge["articles"], faqs: RetrievedKnowledge["faqs"]): ChatSourceRef[] {
  const fromArticles: ChatSourceRef[] = articles.map((a) => ({
    type: "article",
    id: a.id,
    title: a.title,
  }));
  const fromFaqs: ChatSourceRef[] = faqs.map((f) => ({
    type: "faq",
    id: f.id,
    title: f.question,
  }));
  return [...fromArticles, ...fromFaqs].slice(0, RETRIEVAL_LIMIT);
}

function deriveConversationTitle(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45)}...`;
}

function toLlmHistory(messages: ChatMessage[]): LlmHistoryTurn[] {
  return messages
    .filter((m): m is ChatMessage & { role: "user" | "assistant" } =>
      m.role === "user" || m.role === "assistant",
    )
    .map((m) => ({ role: m.role, content: m.content }));
}

function toLlmHistoryFromClient(
  history: { role: "user" | "assistant"; content: string }[] | undefined,
): LlmHistoryTurn[] {
  if (!history?.length) return [];
  return history.map((m) => ({ role: m.role, content: m.content }));
}

export class ChatbotService {
  private readonly knowledgeRepo = createKnowledgeRepository();
  private readonly chatRepo = createChatRepository();

  getSuggestedPrompts() {
    return CHAT_SUGGESTED_PROMPTS_SEED;
  }

  async listConversations(userId: string, farmId: string) {
    return this.chatRepo.listConversations(userId, farmId);
  }

  async getConversationMessages(userId: string, farmId: string, conversationId: string) {
    const conv = await this.chatRepo.getConversation(userId, farmId, conversationId);
    if (!conv) {
      throw new AppError("NOT_FOUND");
    }
    return this.chatRepo.listMessages(userId, farmId, conversationId);
  }

  async deleteConversation(userId: string, farmId: string, conversationId: string) {
    const conv = await this.chatRepo.getConversation(userId, farmId, conversationId);
    if (!conv) {
      throw new AppError("NOT_FOUND");
    }
    await this.chatRepo.deleteConversation(userId, farmId, conversationId);
  }

  async createConversation(userId: string, farmId: string) {
    return this.chatRepo.createConversation(userId, farmId, "Cuộc trò chuyện mới");
  }

  private async retrieveKnowledge(query: string, intent: ReturnType<typeof detectQueryIntent>): Promise<RetrievedKnowledge> {
    const { articles, faqs } = await this.knowledgeRepo.searchPublished(query, RETRIEVAL_LIMIT, intent);
    const sources = buildSources(articles, faqs);
    return { articles, faqs, sources };
  }

  private async composeAssistantReply(params: {
    farmId: string;
    message: string;
    history?: LlmHistoryTurn[];
  }): Promise<{ replyText: string; sources: ChatSourceRef[] }> {
    const intent = detectQueryIntent(params.message);
    const retrieved = await this.retrieveKnowledge(params.message, intent);
    const farmSnippet = await buildFarmContextSnippet(params.farmId, intent);

    const knowledgeBlock = buildKnowledgeContextBlock(
      retrieved.articles.map((a) => ({
        title: a.title,
        summary: a.summary,
        content: a.content,
        category: a.category,
      })),
      retrieved.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    );
    const farmBlock = buildFarmDataBlock(farmSnippet);

    const { content: replyText } = await generateAssistantReply({
      systemPrompt: CHATBOT_SYSTEM_PROMPT,
      knowledgeBlock,
      farmBlock,
      userQuestion: params.message,
      intent,
      history: params.history,
    });

    markKnowledgeSourcesUsed(retrieved.sources);
    return { replyText, sources: retrieved.sources };
  }

  async handleUserMessage(params: {
    userId: string;
    farmId: string;
    message: string;
    conversationId?: string;
  }): Promise<ChatApiResponse> {
    const { userId, farmId, message } = params;
    let conversationId = params.conversationId;
    let priorHistory: LlmHistoryTurn[] = [];

    if (conversationId) {
      const existing = await this.chatRepo.getConversation(userId, farmId, conversationId);
      if (!existing) {
        throw new AppError("NOT_FOUND");
      }
      const priorMessages = await this.chatRepo.listMessages(userId, farmId, conversationId);
      priorHistory = toLlmHistory(priorMessages);
    } else {
      const created = await this.chatRepo.createConversation(userId, farmId, deriveConversationTitle(message));
      conversationId = created.id;
    }

    await this.chatRepo.appendMessage(userId, farmId, conversationId, "user", message);

    const { replyText, sources } = await this.composeAssistantReply({
      farmId,
      message,
      history: priorHistory,
    });

    const assistantMessage = await this.chatRepo.appendMessage(
      userId,
      farmId,
      conversationId,
      "assistant",
      replyText,
      sources,
    );

    const allMessages = await this.chatRepo.listMessages(userId, farmId, conversationId);
    if (allMessages.filter((m) => m.role === "user").length === 1) {
      await this.chatRepo.touchConversation(conversationId, deriveConversationTitle(message));
    }

    return {
      conversationId,
      message: assistantMessage,
      sources,
    };
  }

  /** Guest mode: RAG + LLM reply, no DB persistence. */
  async handleGuestMessage(
    message: string,
    clientHistory?: { role: "user" | "assistant"; content: string }[],
  ): Promise<ChatApiResponse> {
    const farmId = DEFAULT_FARM_ID;
    const conversationId = `guest-${randomUUID()}`;

    const { replyText, sources } = await this.composeAssistantReply({
      farmId,
      message,
      history: toLlmHistoryFromClient(clientHistory),
    });

    const now = new Date().toISOString();
    return {
      conversationId,
      message: {
        id: randomUUID(),
        conversationId,
        role: "assistant",
        content: replyText,
        sources,
        createdAt: now,
      },
      sources,
    };
  }
}

export const chatbotService = new ChatbotService();

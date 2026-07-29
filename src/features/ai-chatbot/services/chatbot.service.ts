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
import type { ChatApiResponse, ChatSourceRef, RetrievedKnowledge } from "../types/chatbot.types";
import { buildFarmContextSnippet } from "./farm-context.service";
import { generateAssistantReply } from "./llm.service";
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

  async createConversation(userId: string, farmId: string) {
    return this.chatRepo.createConversation(userId, farmId, "Cuộc trò chuyện mới");
  }

  private async retrieveKnowledge(query: string, intent: ReturnType<typeof detectQueryIntent>): Promise<RetrievedKnowledge> {
    const { articles, faqs } = await this.knowledgeRepo.searchPublished(query, RETRIEVAL_LIMIT, intent);
    const sources = buildSources(articles, faqs);
    return { articles, faqs, sources };
  }

  async handleUserMessage(params: {
    userId: string;
    farmId: string;
    message: string;
    conversationId?: string;
  }): Promise<ChatApiResponse> {
    const { userId, farmId, message } = params;
    let conversationId = params.conversationId;

    if (conversationId) {
      const existing = await this.chatRepo.getConversation(userId, farmId, conversationId);
      if (!existing) {
        throw new AppError("NOT_FOUND");
      }
    } else {
      const created = await this.chatRepo.createConversation(userId, farmId, deriveConversationTitle(message));
      conversationId = created.id;
    }

    await this.chatRepo.appendMessage(userId, farmId, conversationId, "user", message);

    const intent = detectQueryIntent(message);
    const retrieved = await this.retrieveKnowledge(message, intent);
    const farmSnippet = await buildFarmContextSnippet(farmId, intent);

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

    const replyText = await generateAssistantReply({
      systemPrompt: CHATBOT_SYSTEM_PROMPT,
      knowledgeBlock,
      farmBlock,
      userQuestion: message,
      intent,
    });

    markKnowledgeSourcesUsed(retrieved.sources);

    const assistantMessage = await this.chatRepo.appendMessage(
      userId,
      farmId,
      conversationId,
      "assistant",
      replyText,
      retrieved.sources,
    );

    const priorMessages = await this.chatRepo.listMessages(userId, farmId, conversationId);
    if (priorMessages.filter((m) => m.role === "user").length === 1) {
      await this.chatRepo.touchConversation(conversationId, deriveConversationTitle(message));
    }

    return {
      conversationId,
      message: assistantMessage,
      sources: retrieved.sources,
    };
  }
}

export const chatbotService = new ChatbotService();

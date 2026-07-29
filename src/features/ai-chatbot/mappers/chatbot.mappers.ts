import { normalizeKnowledgeCategory } from "../constants/knowledge-categories";
import type {
  ChatConversation,
  ChatMessage,
  ChatSourceRef,
  KnowledgeArticle,
  KnowledgeArticleRow,
  KnowledgeFaq,
  KnowledgeFaqRow,
} from "../types/chatbot.types";

export function mapKnowledgeArticleRow(row: KnowledgeArticleRow): KnowledgeArticle {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    content: row.content,
    category: normalizeKnowledgeCategory(row.category),
    keywords: row.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapKnowledgeFaqRow(row: KnowledgeFaqRow): KnowledgeFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    keywords: row.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function parseChatSources(raw: unknown): ChatSourceRef[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(
    (item): item is ChatSourceRef =>
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      "id" in item &&
      "title" in item &&
      (item.type === "article" || item.type === "faq") &&
      typeof item.id === "string" &&
      typeof item.title === "string",
  );
}

export function mapChatConversation(row: {
  id: string;
  user_id: string;
  farm_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}): ChatConversation {
  return {
    id: row.id,
    userId: row.user_id,
    farmId: row.farm_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapChatMessage(row: {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  sources: unknown;
  created_at: string;
}): ChatMessage {
  const role = row.role === "user" || row.role === "assistant" || row.role === "system"
    ? row.role
    : "assistant";
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role,
    content: row.content,
    sources: parseChatSources(row.sources),
    createdAt: row.created_at,
  };
}

import { randomUUID } from "crypto";
import { mapChatConversation, mapChatMessage } from "../mappers/chatbot.mappers";
import type { ChatConversation, ChatMessage, ChatSourceRef } from "../types/chatbot.types";
import type { ChatRepository } from "./chat.repository";

type ConversationRow = {
  id: string;
  user_id: string;
  farm_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  sources: ChatSourceRef[];
  created_at: string;
};

const conversations = new Map<string, ConversationRow>();
const messages = new Map<string, MessageRow[]>();

function assertOwner(row: ConversationRow, userId: string, farmId: string): void {
  if (row.user_id !== userId || row.farm_id !== farmId) {
    throw new Error("FORBIDDEN");
  }
}

export class SeedChatRepository implements ChatRepository {
  async listConversations(userId: string, farmId: string): Promise<ChatConversation[]> {
    return [...conversations.values()]
      .filter((c) => c.user_id === userId && c.farm_id === farmId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map(mapChatConversation);
  }

  async getConversation(
    userId: string,
    farmId: string,
    conversationId: string,
  ): Promise<ChatConversation | null> {
    const row = conversations.get(conversationId);
    if (!row) return null;
    assertOwner(row, userId, farmId);
    return mapChatConversation(row);
  }

  async createConversation(userId: string, farmId: string, title: string): Promise<ChatConversation> {
    const now = new Date().toISOString();
    const id = randomUUID();
    const row: ConversationRow = {
      id,
      user_id: userId,
      farm_id: farmId,
      title,
      created_at: now,
      updated_at: now,
    };
    conversations.set(id, row);
    messages.set(id, []);
    return mapChatConversation(row);
  }

  async touchConversation(conversationId: string, title?: string): Promise<void> {
    const row = conversations.get(conversationId);
    if (!row) return;
    conversations.set(conversationId, {
      ...row,
      title: title ?? row.title,
      updated_at: new Date().toISOString(),
    });
  }

  async listMessages(
    userId: string,
    farmId: string,
    conversationId: string,
  ): Promise<ChatMessage[]> {
    const conv = conversations.get(conversationId);
    if (!conv) return [];
    assertOwner(conv, userId, farmId);
    return (messages.get(conversationId) ?? []).map(mapChatMessage);
  }

  async appendMessage(
    userId: string,
    farmId: string,
    conversationId: string,
    role: ChatMessage["role"],
    content: string,
    sources: ChatSourceRef[] = [],
  ): Promise<ChatMessage> {
    const conv = conversations.get(conversationId);
    if (!conv) throw new Error("NOT_FOUND");
    assertOwner(conv, userId, farmId);

    const row: MessageRow = {
      id: randomUUID(),
      conversation_id: conversationId,
      role,
      content,
      sources,
      created_at: new Date().toISOString(),
    };
    const list = messages.get(conversationId) ?? [];
    messages.set(conversationId, [...list, row]);
    await this.touchConversation(conversationId);
    return mapChatMessage(row);
  }
}

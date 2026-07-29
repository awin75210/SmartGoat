import type { ChatConversation, ChatMessage, ChatSourceRef } from "../types/chatbot.types";

export interface ChatRepository {
  listConversations(userId: string, farmId: string): Promise<ChatConversation[]>;
  getConversation(userId: string, farmId: string, conversationId: string): Promise<ChatConversation | null>;
  createConversation(userId: string, farmId: string, title: string): Promise<ChatConversation>;
  touchConversation(conversationId: string, title?: string): Promise<void>;
  listMessages(userId: string, farmId: string, conversationId: string): Promise<ChatMessage[]>;
  appendMessage(
    userId: string,
    farmId: string,
    conversationId: string,
    role: ChatMessage["role"],
    content: string,
    sources?: ChatSourceRef[],
  ): Promise<ChatMessage>;
}

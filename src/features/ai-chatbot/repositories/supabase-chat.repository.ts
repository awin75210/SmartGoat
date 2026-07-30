import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { mapChatConversation, mapChatMessage } from "../mappers/chatbot.mappers";
import type { ChatConversation, ChatMessage, ChatSourceRef } from "../types/chatbot.types";
import type { ChatRepository } from "./chat.repository";

export class SupabaseChatRepository implements ChatRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async listConversations(userId: string, farmId: string): Promise<ChatConversation[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("farm_id", farmId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapChatConversation);
  }

  async getConversation(
    userId: string,
    farmId: string,
    conversationId: string,
  ): Promise<ChatConversation | null> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("farm_id", farmId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapChatConversation(data) : null;
  }

  async createConversation(userId: string, farmId: string, title: string): Promise<ChatConversation> {
    const supabase = await this.client();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: userId,
        farm_id: farmId,
        title,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapChatConversation(data);
  }

  async touchConversation(conversationId: string, title?: string): Promise<void> {
    const supabase = await this.client();
    const payload: { updated_at: string; title?: string } = {
      updated_at: new Date().toISOString(),
    };
    if (title) payload.title = title;
    const { error } = await supabase.from("chat_conversations").update(payload).eq("id", conversationId);
    if (error) throw error;
  }

  async listMessages(
    userId: string,
    farmId: string,
    conversationId: string,
  ): Promise<ChatMessage[]> {
    const conv = await this.getConversation(userId, farmId, conversationId);
    if (!conv) return [];
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapChatMessage);
  }

  async appendMessage(
    userId: string,
    farmId: string,
    conversationId: string,
    role: ChatMessage["role"],
    content: string,
    sources: ChatSourceRef[] = [],
  ): Promise<ChatMessage> {
    const conv = await this.getConversation(userId, farmId, conversationId);
    if (!conv) throw new Error("NOT_FOUND");

    const supabase = await this.client();
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        sources,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    await this.touchConversation(conversationId);
    return mapChatMessage(data);
  }

  async deleteConversation(userId: string, farmId: string, conversationId: string): Promise<void> {
    const conv = await this.getConversation(userId, farmId, conversationId);
    if (!conv) throw new Error("NOT_FOUND");

    const supabase = await this.client();
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("farm_id", farmId);
    if (error) throw error;
  }
}

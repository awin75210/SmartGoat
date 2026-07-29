import type { ChatConversation, ChatMessage } from "../types/chatbot.types";

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; message?: string; code?: string };

async function parseApiJson<T>(res: Response): Promise<ApiSuccess<T> | ApiFailure> {
  try {
    return (await res.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    return { ok: false, message: `Phản hồi không hợp lệ (HTTP ${res.status})` };
  }
}

export async function fetchChatConversations(): Promise<ApiSuccess<ChatConversation[]> | ApiFailure> {
  const res = await fetch("/api/ai/conversations", { credentials: "same-origin" });
  const json = await parseApiJson<ChatConversation[]>(res);
  if (!res.ok || !json.ok) {
    return json.ok ? { ok: false, message: "Không tải được danh sách hội thoại" } : json;
  }
  return json;
}

export async function fetchChatMessages(
  conversationId: string,
): Promise<ApiSuccess<ChatMessage[]> | ApiFailure> {
  const res = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
    credentials: "same-origin",
  });
  const json = await parseApiJson<ChatMessage[]>(res);
  if (!res.ok || !json.ok) {
    return json.ok ? { ok: false, message: "Không tải được tin nhắn" } : json;
  }
  return json;
}

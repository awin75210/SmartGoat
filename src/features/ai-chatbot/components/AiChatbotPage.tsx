import { AiChatbotPanel } from "../components/AiChatbotPanel";
import type { ChatConversation, ChatSuggestedPrompt } from "../types/chatbot.types";

type AiChatbotPageProps = {
  suggestedPrompts: ChatSuggestedPrompt[];
  isGuest: boolean;
  initialConversations: ChatConversation[];
  aiApiConfigured: boolean;
};

export function AiChatbotPage({
  suggestedPrompts,
  isGuest,
  initialConversations,
  aiApiConfigured,
}: AiChatbotPageProps) {
  return (
    <AiChatbotPanel
      suggestedPrompts={suggestedPrompts}
      isGuest={isGuest}
      initialConversations={initialConversations}
      aiApiConfigured={aiApiConfigured}
    />
  );
}

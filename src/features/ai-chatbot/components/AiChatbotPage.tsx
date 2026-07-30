import { AiChatbotPanel } from "../components/AiChatbotPanel";
import type { ChatConversation, ChatSuggestedPrompt } from "../types/chatbot.types";

type AiChatbotPageProps = {
  suggestedPrompts: ChatSuggestedPrompt[];
  isGuest: boolean;
  initialConversations: ChatConversation[];
  aiApiConfigured: boolean;
  initialQuery?: string;
};

export function AiChatbotPage({
  suggestedPrompts,
  isGuest,
  initialConversations,
  aiApiConfigured,
  initialQuery = "",
}: AiChatbotPageProps) {
  return (
    <AiChatbotPanel
      suggestedPrompts={suggestedPrompts}
      isGuest={isGuest}
      initialConversations={initialConversations}
      aiApiConfigured={aiApiConfigured}
      initialQuery={initialQuery}
    />
  );
}

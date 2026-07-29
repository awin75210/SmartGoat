import { AiChatbotPanel } from "../components/AiChatbotPanel";
import type { ChatConversation, ChatSuggestedPrompt } from "../types/chatbot.types";

type AiChatbotPageProps = {
  suggestedPrompts: ChatSuggestedPrompt[];
  isGuest: boolean;
  initialConversations: ChatConversation[];
};

export function AiChatbotPage({ suggestedPrompts, isGuest, initialConversations }: AiChatbotPageProps) {
  return (
    <AiChatbotPanel
      suggestedPrompts={suggestedPrompts}
      isGuest={isGuest}
      initialConversations={initialConversations}
    />
  );
}

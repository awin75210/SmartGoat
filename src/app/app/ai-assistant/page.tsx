import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { isAiApiConfigured } from "@/lib/supabase/env";
import { chatbotService } from "@/features/ai-chatbot/services/chatbot.service";
import { AiChatbotPage } from "@/features/ai-chatbot/components/AiChatbotPage";
import type { ChatConversation } from "@/features/ai-chatbot/types/chatbot.types";

export default async function AiAssistantRoutePage() {
  const session = await resolveAppSession();
  await requireFarmContext();
  const suggestedPrompts = chatbotService.getSuggestedPrompts();
  const aiApiConfigured = isAiApiConfigured();

  let initialConversations: ChatConversation[] = [];
  if (!session.isGuest && session.farmId) {
    initialConversations = await chatbotService.listConversations(session.userId, session.farmId);
  }

  return (
    <AiChatbotPage
      suggestedPrompts={suggestedPrompts}
      isGuest={session.isGuest}
      initialConversations={initialConversations}
      aiApiConfigured={aiApiConfigured}
    />
  );
}

import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { isAiApiConfigured } from "@/lib/supabase/env";
import { chatbotService } from "@/features/ai-chatbot/services/chatbot.service";
import { AiChatbotPage } from "@/features/ai-chatbot/components/AiChatbotPage";

export default async function AiAssistantRoutePage() {
  const session = await resolveAppSession();
  const { farmId, isGuest } = await requireFarmContext();
  const suggestedPrompts = chatbotService.getSuggestedPrompts();
  const aiApiConfigured = isAiApiConfigured();
  const initialConversations = isGuest
    ? []
    : await chatbotService.listConversations(session.userId, farmId);

  return (
    <AiChatbotPage
      suggestedPrompts={suggestedPrompts}
      isGuest={isGuest}
      initialConversations={initialConversations}
      aiApiConfigured={aiApiConfigured}
    />
  );
}

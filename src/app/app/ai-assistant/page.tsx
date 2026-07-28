import { requireFarmContext } from "@/lib/auth/server-context";
import { aiAssistantService } from "@/features/ai-assistant/services/ai-assistant.service";
import { AiAssistantPage } from "@/features/ai-assistant/components/AiAssistantPage";

export default async function AiAssistantRoutePage() {
  await requireFarmContext();
  const suggestedPrompts = await aiAssistantService.getSuggestedPrompts();

  return <AiAssistantPage suggestedPrompts={suggestedPrompts} />;
}

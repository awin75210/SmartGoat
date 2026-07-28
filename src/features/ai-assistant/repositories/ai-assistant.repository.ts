import type { AiSuggestedPrompt } from "../types/ai-assistant.types";

export interface AiAssistantRepository {
  matchResponse(prompt: string): Promise<string>;
  getSuggestedPrompts(): Promise<AiSuggestedPrompt[]>;
}

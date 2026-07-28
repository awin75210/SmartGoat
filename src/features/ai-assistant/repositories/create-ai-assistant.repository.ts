import { SeedAiAssistantRepository } from "./seed-ai-assistant.repository";
import type { AiAssistantRepository } from "./ai-assistant.repository";

export function createAiAssistantRepository(): AiAssistantRepository {
  return new SeedAiAssistantRepository();
}

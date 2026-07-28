import { AI_RESPONSES_SEED, AI_SUGGESTED_PROMPTS_SEED } from "../data/ai-assistant.seed";
import type { AiAssistantRepository } from "./ai-assistant.repository";

export class SeedAiAssistantRepository implements AiAssistantRepository {
  async matchResponse(prompt: string): Promise<string> {
    const normalized = prompt.toLowerCase();
    const match = AI_RESPONSES_SEED.find((row) =>
      row.prompt_keywords.split(",").some((kw) => normalized.includes(kw.trim())),
    );
    return match?.response ?? AI_RESPONSES_SEED.find((r) => r.prompt_keywords === "default")!.response;
  }

  async getSuggestedPrompts() {
    return AI_SUGGESTED_PROMPTS_SEED;
  }
}

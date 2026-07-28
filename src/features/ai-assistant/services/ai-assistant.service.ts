import { createAiAssistantRepository } from "../repositories/create-ai-assistant.repository";

export class AiAssistantService {
  private readonly repo = createAiAssistantRepository();

  async getSuggestedPrompts() {
    return this.repo.getSuggestedPrompts();
  }

  async generateReply(prompt: string): Promise<string> {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return "Vui lòng nhập câu hỏi.";
    }
    return this.repo.matchResponse(trimmed);
  }
}

export const aiAssistantService = new AiAssistantService();

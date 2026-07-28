"use server";

import { requireFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { aiAssistantService } from "../services/ai-assistant.service";

export async function askAiAssistantAction(prompt: string): Promise<ActionResult<{ reply: string }>> {
  return toActionResult(async () => {
    await requireFarmContext();
    const reply = await aiAssistantService.generateReply(prompt);
    return { reply };
  });
}

"use client";

import { AiChatPanel } from "../components/AiChatPanel";
import type { AiSuggestedPrompt } from "../types/ai-assistant.types";

type AiAssistantPageProps = {
  suggestedPrompts: AiSuggestedPrompt[];
};

export function AiAssistantPage({ suggestedPrompts }: AiAssistantPageProps) {
  return <AiChatPanel suggestedPrompts={suggestedPrompts} />;
}

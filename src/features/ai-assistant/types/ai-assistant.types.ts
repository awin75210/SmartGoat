export type AiMessageRole = "user" | "assistant";

export type AiResponseRow = {
  id: string;
  prompt_keywords: string;
  response: string;
};

export type AiChatMessage = {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
};

export type AiSuggestedPrompt = {
  id: string;
  label: string;
  prompt: string;
};

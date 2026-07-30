export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }
  return key;
}

export type AiProvider = "openai" | "gemini";

export function getAiProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "gemini") return "gemini";
  if (explicit === "openai") return "openai";

  const base = process.env.AI_API_BASE_URL?.trim() ?? "";
  if (base.includes("generativelanguage.googleapis.com")) {
    return "gemini";
  }

  return "openai";
}

export function getAiApiKey(): string | undefined {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const aiKey = process.env.AI_API_KEY?.trim();

  if (getAiProvider() === "gemini") {
    return geminiKey || aiKey || undefined;
  }
  return aiKey || geminiKey || undefined;
}

export function isAiApiConfigured(): boolean {
  return Boolean(getAiApiKey());
}

export function getAiApiBaseUrl(): string {
  const configured = process.env.AI_API_BASE_URL?.trim();
  if (configured) return configured;

  return getAiProvider() === "gemini"
    ? "https://generativelanguage.googleapis.com/v1beta/openai"
    : "https://api.openai.com/v1";
}

export function getAiModel(): string {
  const configured = process.env.AI_MODEL?.trim();
  if (configured) return configured;

  return getAiProvider() === "gemini" ? "gemini-2.0-flash" : "gpt-4o-mini";
}

export function getChatCompletionsUrl(): string {
  return `${getAiApiBaseUrl().replace(/\/+$/, "")}/chat/completions`;
}

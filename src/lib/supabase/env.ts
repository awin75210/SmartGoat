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

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
}

export function isSupabaseServiceRoleConfigured(): boolean {
  return Boolean(getSupabaseServiceRoleKey());
}

export type AiProvider = "openai" | "gemini" | "groq" | "ollama";

export function getAiProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "gemini") return "gemini";
  if (explicit === "groq") return "groq";
  if (explicit === "ollama") return "ollama";
  if (explicit === "openai") return "openai";

  const base = process.env.AI_API_BASE_URL?.trim() ?? "";
  if (base.includes("generativelanguage.googleapis.com")) return "gemini";
  if (base.includes("api.groq.com")) return "groq";
  if (base.includes("localhost:11434") || base.includes("127.0.0.1:11434")) return "ollama";

  return "openai";
}

export function getAiApiKey(): string | undefined {
  const provider = getAiProvider();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const aiKey = process.env.AI_API_KEY?.trim();

  switch (provider) {
    case "gemini":
      return geminiKey || aiKey || undefined;
    case "groq":
      return groqKey || aiKey || undefined;
    case "ollama":
      return aiKey || "ollama";
    default:
      return aiKey || groqKey || geminiKey || undefined;
  }
}

export function isAiApiConfigured(): boolean {
  if (getAiProvider() === "ollama") {
    return true;
  }
  return Boolean(getAiApiKey());
}

export function getAiApiBaseUrl(): string {
  const configured = process.env.AI_API_BASE_URL?.trim();
  if (configured) return configured;

  switch (getAiProvider()) {
    case "gemini":
      return "https://generativelanguage.googleapis.com/v1beta/openai";
    case "groq":
      return "https://api.groq.com/openai/v1";
    case "ollama":
      return "http://localhost:11434/v1";
    default:
      return "https://api.openai.com/v1";
  }
}

export function getAiModel(): string {
  const configured = process.env.AI_MODEL?.trim();
  if (configured) return configured;

  switch (getAiProvider()) {
    case "gemini":
      return "gemini-2.0-flash";
    case "groq":
      return "llama-3.3-70b-versatile";
    case "ollama":
      return "llama3.2";
    default:
      return "gpt-4o-mini";
  }
}

export function getChatCompletionsUrl(): string {
  return `${getAiApiBaseUrl().replace(/\/+$/, "")}/chat/completions`;
}

export function getAiSetupHint(): string {
  switch (getAiProvider()) {
    case "groq":
      return "GROQ_API_KEY (miễn phí tại console.groq.com)";
    case "ollama":
      return "Ollama đang chạy local (ollama serve + ollama pull llama3.2)";
    case "gemini":
      return "GEMINI_API_KEY (Google AI Studio)";
    default:
      return "AI_API_KEY hoặc GROQ_API_KEY";
  }
}

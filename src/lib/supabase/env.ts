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

export function getAiApiKey(): string | undefined {
  return process.env.AI_API_KEY?.trim() || undefined;
}

export function getAiApiBaseUrl(): string {
  return process.env.AI_API_BASE_URL?.trim() || "https://api.openai.com/v1";
}

export function getAiModel(): string {
  return process.env.AI_MODEL?.trim() || "gpt-4o-mini";
}

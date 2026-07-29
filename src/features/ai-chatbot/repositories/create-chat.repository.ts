import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SeedChatRepository } from "./seed-chat.repository";
import { SupabaseChatRepository } from "./supabase-chat.repository";
import type { ChatRepository } from "./chat.repository";

export function createChatRepository(): ChatRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseChatRepository();
  }
  return new SeedChatRepository();
}

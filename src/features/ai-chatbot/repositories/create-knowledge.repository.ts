import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SeedKnowledgeRepository } from "./seed-knowledge.repository";
import { SupabaseKnowledgeRepository } from "./supabase-knowledge.repository";
import type { KnowledgeRepository } from "./knowledge.repository";

export function createKnowledgeRepository(): KnowledgeRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseKnowledgeRepository();
  }
  return new SeedKnowledgeRepository();
}

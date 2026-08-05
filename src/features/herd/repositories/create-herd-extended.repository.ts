import { isSupabaseConfigured } from "@/lib/supabase/env";
import { seedHerdExtendedRepository } from "./seed-herd-extended.repository";
import { supabaseHerdExtendedRepository } from "./supabase-herd-extended.repository";

export type HerdExtendedRepository = typeof supabaseHerdExtendedRepository;

export function createHerdExtendedRepository(): HerdExtendedRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return supabaseHerdExtendedRepository;
  }
  return seedHerdExtendedRepository as unknown as HerdExtendedRepository;
}

import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BarnRepository } from "./barn.repository";
import { SeedBarnRepository } from "./seed-barn.repository";
import { SupabaseBarnRepository } from "./supabase-barn.repository";

export function createBarnRepository(): BarnRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseBarnRepository();
  }
  return new SeedBarnRepository();
}

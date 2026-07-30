import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SeedFarmRepository } from "./seed-farm.repository";
import { SupabaseFarmRepository } from "./supabase-farm.repository";
import type { FarmRepository } from "./farm.repository";

export function createFarmRepository(): FarmRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseFarmRepository();
  }
  return new SeedFarmRepository();
}

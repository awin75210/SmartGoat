import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { GoatBatchRepository } from "./goat-batch.repository";
import { SeedGoatBatchRepository } from "./seed-goat-batch.repository";
import { SupabaseGoatBatchRepository } from "./supabase-goat-batch.repository";

export function createGoatBatchRepository(): GoatBatchRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseGoatBatchRepository();
  }
  return new SeedGoatBatchRepository();
}

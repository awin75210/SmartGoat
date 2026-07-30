import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SeedSettingsRepository } from "./seed-settings.repository";
import { SupabaseSettingsRepository } from "./supabase-settings.repository";
import type { SettingsRepository } from "./settings.repository";

export function createSettingsRepository(): SettingsRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseSettingsRepository();
  }
  return new SeedSettingsRepository();
}

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SeedIotRepository } from "./seed-iot.repository";
import { SupabaseIotRepository } from "./supabase-iot.repository";
import type { IotRepository } from "./iot.repository";

export function createIotRepository(): IotRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseIotRepository();
  }
  return new SeedIotRepository();
}

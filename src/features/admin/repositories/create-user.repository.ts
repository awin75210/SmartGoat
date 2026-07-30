import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SeedUserRepository } from "./seed-user.repository";
import { SupabaseUserRepository } from "./supabase-user.repository";
import type { UserRepository } from "./user.repository";

export function createUserRepository(): UserRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseUserRepository();
  }
  return new SeedUserRepository();
}

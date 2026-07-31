import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EmailNotifyRepository } from "./email-notify.repository";
import { SeedEmailNotifyRepository } from "./seed-email-notify.repository";
import { SupabaseEmailNotifyRepository } from "./supabase-email-notify.repository";

export function createEmailNotifyRepository(): EmailNotifyRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseEmailNotifyRepository();
  }
  return new SeedEmailNotifyRepository();
}

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl, isSupabaseConfigured } from "../supabase/env";

export function createSupabaseAdminClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  const serviceKey = getSupabaseServiceRoleKey();
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function tryCreateSupabaseAdminClient() {
  try {
    if (!isSupabaseConfigured()) return null;
    if (!getSupabaseServiceRoleKey()) return null;
    return createSupabaseAdminClient();
  } catch {
    return null;
  }
}

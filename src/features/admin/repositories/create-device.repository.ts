import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SeedDeviceRepository } from "./seed-device.repository";
import { SupabaseDeviceRepository } from "./supabase-device.repository";
import type { DeviceRepository } from "./device.repository";

export function createDeviceRepository(): DeviceRepository {
  if (process.env.DATA_SOURCE === "supabase" && isSupabaseConfigured()) {
    return new SupabaseDeviceRepository();
  }
  return new SeedDeviceRepository();
}

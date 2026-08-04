export function getIotDeviceApiKey(): string | undefined {
  return process.env.IOT_DEVICE_API_KEY?.trim() || undefined;
}

export function isIotDeviceApiConfigured(): boolean {
  return Boolean(getIotDeviceApiKey());
}

export {
  getSupabaseServiceRoleKey,
  isSupabaseServiceRoleConfigured,
} from "@/lib/supabase/env";

export function getDefaultIotGatewayId(farmId: string): string {
  if (farmId === "farm-capracare-002") return "dev2-gateway";
  return "dev-gateway";
}

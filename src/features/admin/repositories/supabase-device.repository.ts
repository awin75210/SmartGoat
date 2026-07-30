import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { mapDeviceRowToDomain } from "../mappers/admin.mapper";
import type { DeviceRow } from "../types/admin.types";
import type { DeviceRepository } from "./device.repository";

function normalizeDeviceRow(row: Record<string, unknown>): DeviceRow {
  return {
    id: String(row.id),
    farm_id: String(row.farm_id),
    name: String(row.name),
    device_type: String(row.device_type),
    status:
      row.status === "offline" || row.status === "maintenance" ? row.status : "online",
    last_seen_at: String(row.last_seen_at),
  };
}

export class SupabaseDeviceRepository implements DeviceRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async listDevices(farmId?: string) {
    const supabase = await this.client();
    let query = supabase.from("devices").select("*").order("name");
    if (farmId) {
      query = query.eq("farm_id", farmId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapDeviceRowToDomain(normalizeDeviceRow(row)));
  }

  async createDevices(devices: DeviceRow[]) {
    if (devices.length === 0) return [];
    const supabase = await this.client();
    const { data, error } = await supabase.from("devices").insert(devices).select("*");
    if (error) throw error;
    return (data ?? []).map((row) => mapDeviceRowToDomain(normalizeDeviceRow(row)));
  }

  async deleteByFarmId(farmId: string) {
    const supabase = await this.client();
    const { error } = await supabase.from("devices").delete().eq("farm_id", farmId);
    if (error) throw error;
  }
}

import { AppError } from "@/lib/errors/app-error";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { FARM_SETTINGS_SEED } from "../data/settings.seed";
import { mapSettingsInputToRow, mapSettingsRowToDomain } from "../mappers/settings.mapper";
import type { FarmSettingsRow, UpdateFarmSettingsInput } from "../types/settings.types";
import type { SettingsRepository } from "./settings.repository";

function normalizeRow(row: Record<string, unknown>): FarmSettingsRow {
  return {
    farm_id: String(row.farm_id),
    farm_name: String(row.farm_name),
    timezone: String(row.timezone),
    alert_email: String(row.alert_email),
    notify_push: Boolean(row.notify_push),
    notify_email: Boolean(row.notify_email),
    temperature_high_c: Number(row.temperature_high_c),
    ammonia_max_ppm: Number(row.ammonia_max_ppm),
    updated_at: String(row.updated_at),
  };
}

function defaultRowForFarm(farmId: string): FarmSettingsRow {
  if (farmId === FARM_SETTINGS_SEED.farm_id) {
    return { ...FARM_SETTINGS_SEED, farm_id: farmId };
  }
  return {
    ...FARM_SETTINGS_SEED,
    farm_id: farmId,
    farm_name: "Trang trại của tôi",
  };
}

export class SupabaseSettingsRepository implements SettingsRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async getSettings(farmId: string) {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("farm_settings")
      .select("*")
      .eq("farm_id", farmId)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return mapSettingsRowToDomain(normalizeRow(data));
    }

    const defaults = defaultRowForFarm(farmId);
    const { data: inserted, error: insertError } = await supabase
      .from("farm_settings")
      .insert(defaults)
      .select("*")
      .single();

    if (insertError) throw insertError;
    return mapSettingsRowToDomain(normalizeRow(inserted));
  }

  async updateSettings(farmId: string, input: UpdateFarmSettingsInput, updatedAt: string) {
    const row = mapSettingsInputToRow(farmId, input, updatedAt);
    const supabase = await this.client();
    const { data, error } = await supabase
      .from("farm_settings")
      .upsert(row, { onConflict: "farm_id" })
      .select("*")
      .single();

    if (error) throw error;
    if (!data) {
      throw new AppError("INTERNAL_ERROR");
    }
    return mapSettingsRowToDomain(normalizeRow(data));
  }
}

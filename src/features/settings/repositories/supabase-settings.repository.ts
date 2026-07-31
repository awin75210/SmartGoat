import { AppError } from "@/lib/errors/app-error";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { mapSettingsInputToRow, mapSettingsRowToDomain } from "../mappers/settings.mapper";
import type { FarmSettingsRow, UpdateFarmSettingsInput } from "../types/settings.types";
import { buildDefaultSettingsRow } from "../utils/settings-defaults";
import type { GetSettingsOptions, SettingsRepository } from "./settings.repository";

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

export class SupabaseSettingsRepository implements SettingsRepository {
  private async client() {
    return createSupabaseServerClient();
  }

  async getSettings(farmId: string, options?: GetSettingsOptions) {
    const defaults = buildDefaultSettingsRow(farmId, {
      defaultFarmName: options?.defaultFarmName,
      defaultAlertEmail: options?.defaultAlertEmail,
    });

    const supabase = await this.client();
    const { data, error } = await supabase
      .from("farm_settings")
      .select("*")
      .eq("farm_id", farmId)
      .maybeSingle();

    if (error) {
      console.error("[settings] getSettings select failed", error.message);
      return mapSettingsRowToDomain(defaults);
    }

    if (data) {
      return mapSettingsRowToDomain(normalizeRow(data));
    }

    const { data: inserted, error: insertError } = await supabase
      .from("farm_settings")
      .insert(defaults)
      .select("*")
      .single();

    if (insertError) {
      console.warn("[settings] auto-insert failed, using defaults", insertError.message);
      return mapSettingsRowToDomain(defaults);
    }

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

    if (error) {
      console.error("[settings] updateSettings failed", error.message);
      throw new AppError(
        "INTERNAL_ERROR",
        "Không lưu được cài đặt. Kiểm tra quyền truy cập hoặc chạy migration Supabase (farm_settings).",
      );
    }

    if (!data) {
      throw new AppError("INTERNAL_ERROR");
    }

    return mapSettingsRowToDomain(normalizeRow(data));
  }
}

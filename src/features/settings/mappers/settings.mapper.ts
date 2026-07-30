import type { FarmSettings, FarmSettingsRow, UpdateFarmSettingsInput } from "../types/settings.types";

export function mapSettingsRowToDomain(row: FarmSettingsRow): FarmSettings {
  return {
    farmId: row.farm_id,
    farmName: row.farm_name,
    timezone: row.timezone,
    alertEmail: row.alert_email,
    notifyPush: row.notify_push,
    notifyEmail: row.notify_email,
    temperatureHighC: row.temperature_high_c,
    ammoniaMaxPpm: row.ammonia_max_ppm,
    updatedAt: row.updated_at,
  };
}

export function mapSettingsInputToRow(
  farmId: string,
  input: UpdateFarmSettingsInput,
  updatedAt: string,
): FarmSettingsRow {
  return {
    farm_id: farmId,
    farm_name: input.farmName,
    timezone: input.timezone,
    alert_email: input.alertEmail,
    notify_push: input.notifyPush,
    notify_email: input.notifyEmail,
    temperature_high_c: input.temperatureHighC,
    ammonia_max_ppm: input.ammoniaMaxPpm,
    updated_at: updatedAt,
  };
}

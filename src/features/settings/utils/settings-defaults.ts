import { FARM_SETTINGS_SEED } from "../data/settings.seed";
import type { FarmSettings, FarmSettingsRow } from "../types/settings.types";

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (UTC+7)" },
  { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
] as const;

export function buildDefaultSettingsRow(
  farmId: string,
  options?: { defaultFarmName?: string; defaultAlertEmail?: string },
): FarmSettingsRow {
  const base =
    farmId === FARM_SETTINGS_SEED.farm_id
      ? { ...FARM_SETTINGS_SEED, farm_id: farmId }
      : {
          ...FARM_SETTINGS_SEED,
          farm_id: farmId,
          farm_name: options?.defaultFarmName?.trim() || "Trang trại của tôi",
        };

  if (options?.defaultAlertEmail?.trim()) {
    base.alert_email = options.defaultAlertEmail.trim();
  }

  return base;
}

export function settingsToFormValues(settings: FarmSettings) {
  return {
    farmName: settings.farmName,
    timezone: settings.timezone,
    alertEmail: settings.alertEmail,
    notifyPush: settings.notifyPush,
    notifyEmail: settings.notifyEmail,
    temperatureHighC: settings.temperatureHighC,
    ammoniaMaxPpm: settings.ammoniaMaxPpm,
  };
}

export function settingsRowToFormValues(row: FarmSettingsRow) {
  return {
    farmName: row.farm_name,
    timezone: row.timezone,
    alertEmail: row.alert_email,
    notifyPush: row.notify_push,
    notifyEmail: row.notify_email,
    temperatureHighC: row.temperature_high_c,
    ammoniaMaxPpm: row.ammonia_max_ppm,
  };
}

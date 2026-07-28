import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import type { FarmSettingsRow } from "../types/settings.types";

export const FARM_SETTINGS_SEED: FarmSettingsRow = {
  farm_id: DEFAULT_FARM_ID,
  farm_name: "Trang trại CapraCare",
  timezone: "Asia/Ho_Chi_Minh",
  alert_email: "owner@capracare.demo",
  notify_push: true,
  notify_sms: false,
  temperature_high_c: 28,
  ammonia_max_ppm: 10,
  updated_at: SEED_REFERENCE_ISO,
};

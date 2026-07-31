import type { FarmSettings, UpdateFarmSettingsInput } from "../types/settings.types";

export type GetSettingsOptions = {
  defaultAlertEmail?: string;
  defaultFarmName?: string;
};

export interface SettingsRepository {
  getSettings(farmId: string, options?: GetSettingsOptions): Promise<FarmSettings>;
  updateSettings(farmId: string, input: UpdateFarmSettingsInput, updatedAt: string): Promise<FarmSettings>;
}

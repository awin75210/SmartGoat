import type { FarmSettings, UpdateFarmSettingsInput } from "../types/settings.types";

export interface SettingsRepository {
  getSettings(farmId: string): Promise<FarmSettings>;
  updateSettings(farmId: string, input: UpdateFarmSettingsInput, updatedAt: string): Promise<FarmSettings>;
}

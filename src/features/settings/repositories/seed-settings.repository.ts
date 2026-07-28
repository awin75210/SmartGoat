import { AppError } from "@/lib/errors/app-error";
import { FARM_SETTINGS_SEED } from "../data/settings.seed";
import { mapSettingsInputToRow, mapSettingsRowToDomain } from "../mappers/settings.mapper";
import type { UpdateFarmSettingsInput } from "../types/settings.types";
import type { SettingsRepository } from "./settings.repository";

let inMemorySettings = { ...FARM_SETTINGS_SEED };

export class SeedSettingsRepository implements SettingsRepository {
  async getSettings(farmId: string) {
    if (inMemorySettings.farm_id !== farmId) {
      throw new AppError("FARM_NOT_FOUND");
    }
    return mapSettingsRowToDomain(inMemorySettings);
  }

  async updateSettings(farmId: string, input: UpdateFarmSettingsInput, updatedAt: string) {
    if (inMemorySettings.farm_id !== farmId) {
      throw new AppError("FARM_NOT_FOUND");
    }
    inMemorySettings = mapSettingsInputToRow(farmId, input, updatedAt);
    return mapSettingsRowToDomain(inMemorySettings);
  }
}

import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createSettingsRepository } from "../repositories/create-settings.repository";
import type { FarmSettings, UpdateFarmSettingsInput } from "../types/settings.types";

export class SettingsService {
  private readonly repo = createSettingsRepository();

  async getSettings(farmId: string = DEFAULT_FARM_ID): Promise<FarmSettings> {
    return this.repo.getSettings(farmId);
  }

  async updateSettings(
    farmId: string,
    input: UpdateFarmSettingsInput,
    updatedAt: string,
  ): Promise<FarmSettings> {
    return this.repo.updateSettings(farmId, input, updatedAt);
  }
}

export const settingsService = new SettingsService();

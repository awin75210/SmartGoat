import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { mapSettingsRowToDomain } from "../mappers/settings.mapper";
import { createSettingsRepository } from "../repositories/create-settings.repository";
import type { GetSettingsOptions } from "../repositories/settings.repository";
import type { FarmSettings, UpdateFarmSettingsInput } from "../types/settings.types";
import { buildDefaultSettingsRow } from "../utils/settings-defaults";

export type LoadSettingsOptions = GetSettingsOptions & {
  isGuest?: boolean;
};

export class SettingsService {
  private readonly repo = createSettingsRepository();

  getDefaultSettings(
    farmId: string = DEFAULT_FARM_ID,
    options?: GetSettingsOptions,
  ): FarmSettings {
    return mapSettingsRowToDomain(buildDefaultSettingsRow(farmId, options));
  }

  async getSettings(
    farmId: string = DEFAULT_FARM_ID,
    options?: LoadSettingsOptions,
  ): Promise<FarmSettings> {
    if (options?.isGuest) {
      return this.getDefaultSettings(farmId, {
        defaultAlertEmail: options.defaultAlertEmail,
        defaultFarmName: options.defaultFarmName,
      });
    }

    return this.repo.getSettings(farmId, options);
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

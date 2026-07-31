import { FARM_SETTINGS_SEED } from "../data/settings.seed";
import { mapSettingsInputToRow, mapSettingsRowToDomain } from "../mappers/settings.mapper";
import type { UpdateFarmSettingsInput } from "../types/settings.types";
import { buildDefaultSettingsRow } from "../utils/settings-defaults";
import type { GetSettingsOptions, SettingsRepository } from "./settings.repository";

const settingsByFarm = new Map<string, ReturnType<typeof buildDefaultSettingsRow>>([
  [FARM_SETTINGS_SEED.farm_id, { ...FARM_SETTINGS_SEED }],
]);

function getOrCreateRow(farmId: string, options?: GetSettingsOptions) {
  const existing = settingsByFarm.get(farmId);
  if (existing) return existing;

  const created = buildDefaultSettingsRow(farmId, {
    defaultFarmName: options?.defaultFarmName,
    defaultAlertEmail: options?.defaultAlertEmail,
  });
  settingsByFarm.set(farmId, created);
  return created;
}

export class SeedSettingsRepository implements SettingsRepository {
  async getSettings(farmId: string, options?: GetSettingsOptions) {
    return mapSettingsRowToDomain(getOrCreateRow(farmId, options));
  }

  async updateSettings(farmId: string, input: UpdateFarmSettingsInput, updatedAt: string) {
    if (!settingsByFarm.has(farmId) && farmId !== FARM_SETTINGS_SEED.farm_id) {
      settingsByFarm.set(farmId, buildDefaultSettingsRow(farmId));
    }

    const next = mapSettingsInputToRow(farmId, input, updatedAt);
    settingsByFarm.set(farmId, next);
    return mapSettingsRowToDomain(next);
  }
}

/** @deprecated kept for backwards compatibility in tests */
export function resetSeedSettingsForTests() {
  settingsByFarm.clear();
  settingsByFarm.set(FARM_SETTINGS_SEED.farm_id, { ...FARM_SETTINGS_SEED });
}

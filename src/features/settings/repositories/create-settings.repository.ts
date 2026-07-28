import { SeedSettingsRepository } from "./seed-settings.repository";
import type { SettingsRepository } from "./settings.repository";

export function createSettingsRepository(): SettingsRepository {
  return new SeedSettingsRepository();
}

import { requireFarmContext } from "@/lib/auth/server-context";
import { settingsService } from "@/features/settings/services/settings.service";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export default async function SettingsRoutePage() {
  const { isGuest, farmId } = await requireFarmContext();
  const settings = await settingsService.getSettings(farmId);

  return <SettingsPage settings={settings} readOnly={isGuest} />;
}

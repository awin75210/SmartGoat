import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { resolveAppSession } from "@/lib/auth/server-context";
import { settingsService } from "@/features/settings/services/settings.service";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export default async function SettingsRoutePage() {
  const session = await resolveAppSession();
  const farmId = session.farmId ?? DEFAULT_FARM_ID;
  const settings = await settingsService.getSettings(farmId);

  return (
    <SettingsPage
      settings={settings}
      userEmail={session.isGuest ? undefined : session.email}
      readOnly={session.isGuest}
    />
  );
}

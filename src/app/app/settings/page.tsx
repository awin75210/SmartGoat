import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { getAppBaseUrl, isEmailConfigured } from "@/lib/email/env";
import { isIotDeviceApiConfigured } from "@/lib/iot/env";
import { iotMonitoringService } from "@/features/iot-monitoring/services/iot-monitoring.service";
import { settingsService } from "@/features/settings/services/settings.service";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export default async function SettingsRoutePage() {
  const session = await resolveAppSession();
  const { farmId, isGuest } = await requireFarmContext();

  let settings = settingsService.getDefaultSettings(farmId, {
    defaultAlertEmail: session.email,
  });
  let loadWarning: string | null = null;

  try {
    settings = await settingsService.getSettings(farmId, {
      defaultAlertEmail: session.email,
      isGuest,
    });
  } catch (error) {
    console.error("[settings] page load failed", error instanceof Error ? error.message : error);
    loadWarning = "Không tải được cài đặt từ Supabase. Đang hiển thị giá trị mặc định.";
  }

  const esp32Context = isGuest
    ? null
    : await iotMonitoringService.getFarmIotContext(farmId, {
        farmName: settings.farmName,
        ownerEmail: session.email,
      });

  return (
    <SettingsPage
      settings={settings}
      userEmail={isGuest ? undefined : session.email}
      readOnly={isGuest}
      loadWarning={loadWarning}
      emailConfigured={isEmailConfigured()}
      esp32Context={esp32Context}
      iotApiConfigured={isIotDeviceApiConfigured()}
      appBaseUrl={getAppBaseUrl()}
    />
  );
}

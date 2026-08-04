import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { isEmailConfigured } from "@/lib/email/env";
import { settingsService } from "@/features/settings/services/settings.service";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export default async function SettingsRoutePage() {
  const session = await resolveAppSession();
  const { farmId } = await requireFarmContext();

  let settings = settingsService.getDefaultSettings(farmId, {
    defaultAlertEmail: session.email,
  });
  let loadWarning: string | null = null;

  try {
    settings = await settingsService.getSettings(farmId, {
      defaultAlertEmail: session.email,
    });
  } catch (error) {
    console.error("[settings] page load failed", error instanceof Error ? error.message : error);
    loadWarning = "Không tải được cài đặt từ Supabase. Đang hiển thị giá trị mặc định.";
  }

  return (
    <SettingsPage
      settings={settings}
      userEmail={session.email}
      loadWarning={loadWarning}
      emailConfigured={isEmailConfigured()}
    />
  );
}

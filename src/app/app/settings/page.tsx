import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { resolveAppSession } from "@/lib/auth/server-context";
import { isEmailConfigured } from "@/lib/email/env";
import { settingsService } from "@/features/settings/services/settings.service";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export default async function SettingsRoutePage() {
  const session = await resolveAppSession();
  const farmId = session.farmId ?? DEFAULT_FARM_ID;

  let settings = settingsService.getDefaultSettings(farmId, {
    defaultAlertEmail: session.isGuest ? undefined : session.email,
  });
  let loadWarning: string | null = null;

  try {
    settings = await settingsService.getSettings(farmId, {
      isGuest: session.isGuest,
      defaultAlertEmail: session.isGuest ? undefined : session.email,
    });
  } catch (error) {
    console.error("[settings] page load failed", error instanceof Error ? error.message : error);
    loadWarning =
      "Không tải được cài đặt từ Supabase. Đang hiển thị giá trị mặc định — bạn vẫn có thể lưu sau khi đăng nhập.";
  }

  return (
    <SettingsPage
      settings={settings}
      userEmail={session.isGuest ? undefined : session.email}
      readOnly={session.isGuest}
      loadWarning={loadWarning}
      emailConfigured={isEmailConfigured()}
    />
  );
}

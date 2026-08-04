import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { alertService } from "@/features/alerts/services/alert.service";
import { herdService } from "@/features/herd/services/herd.service";
import { iotMonitoringService } from "@/features/iot-monitoring/services/iot-monitoring.service";
import { IotMonitoringPage } from "@/features/iot-monitoring/components/IotMonitoringPage";
import { farmAlertEmailService } from "@/features/notifications/services/farm-alert-email.service";
import { settingsService } from "@/features/settings/services/settings.service";

export default async function IotPage() {
  const session = await resolveAppSession();
  const { farmId, isGuest } = await requireFarmContext();
  const settings = await settingsService.getSettings(farmId, {
    defaultAlertEmail: session.email,
    defaultFarmName: session.fullName ? `Trang trại ${session.fullName}` : undefined,
    isGuest,
  });

  const [initialSnapshot, latestAlerts, herdStats, farmContext] = await Promise.all([
    iotMonitoringService.getMonitoringSnapshot(farmId, "7d"),
    alertService.getLatestAlerts(farmId, 5),
    herdService.getOverviewStats(farmId),
    iotMonitoringService.getFarmIotContext(farmId, {
      farmName: settings.farmName,
      ownerEmail: isGuest ? undefined : session.email,
    }),
  ]);

  if (!isGuest) {
    try {
      await farmAlertEmailService.evaluateMetricThresholds(settings, initialSnapshot.metrics);
    } catch (error) {
      console.error("[email] IoT threshold check failed", error instanceof Error ? error.message : error);
    }
  }

  return (
    <IotMonitoringPage
      initialSnapshot={initialSnapshot}
      farmContext={farmContext}
      latestAlerts={latestAlerts}
      herdStats={herdStats}
      readOnly={isGuest}
    />
  );
}

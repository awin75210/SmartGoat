import { requireFarmContext } from "@/lib/auth/server-context";
import { alertService } from "@/features/alerts/services/alert.service";
import { herdService } from "@/features/herd/services/herd.service";
import { iotMonitoringService } from "@/features/iot-monitoring/services/iot-monitoring.service";
import { IotMonitoringPage } from "@/features/iot-monitoring/components/IotMonitoringPage";

export default async function IotPage() {
  const { farmId } = await requireFarmContext();
  const [initialSnapshot, latestAlerts, herdStats, herdDisplaySummary] = await Promise.all([
    iotMonitoringService.getMonitoringSnapshot(farmId, "7d"),
    alertService.getLatestAlerts(farmId, 5),
    herdService.getOverviewStats(farmId),
    iotMonitoringService.getHerdDisplaySummary(farmId),
  ]);

  return (
    <IotMonitoringPage
      initialSnapshot={initialSnapshot}
      latestAlerts={latestAlerts}
      herdStats={herdStats}
      herdDisplaySummary={herdDisplaySummary}
    />
  );
}

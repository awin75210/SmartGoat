import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { alertService } from "@/features/alerts/services/alert.service";
import { herdService } from "@/features/herd/services/herd.service";
import { iotMonitoringService } from "@/features/iot-monitoring/services/iot-monitoring.service";
import type { AlertSummary } from "@/features/alerts/types/alert.types";
import type { HerdOverviewStats } from "@/features/herd/types/goat-batch.types";
import type { IotMonitoringSnapshot } from "@/features/iot-monitoring/types/iot.types";

export type DashboardData = {
  iot: IotMonitoringSnapshot;
  herdStats: HerdOverviewStats;
  activeAlertCount: number;
  latestAlerts: AlertSummary[];
};

export class DashboardService {
  async getDashboard(farmId: string = DEFAULT_FARM_ID): Promise<DashboardData> {
    const [iot, herdStats, activeAlertCount, latestAlerts] = await Promise.all([
      iotMonitoringService.getMonitoringSnapshot(farmId, "7d"),
      herdService.getOverviewStats(farmId),
      alertService.countActive(farmId),
      alertService.getLatestAlerts(farmId, 5),
    ]);
    return { iot, herdStats, activeAlertCount, latestAlerts };
  }
}

export const dashboardService = new DashboardService();

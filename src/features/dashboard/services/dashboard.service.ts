import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { alertService } from "@/features/alerts/services/alert.service";
import { herdService } from "@/features/herd/services/herd.service";
import { careReminderService } from "@/features/herd/services/care-reminder.service";
import { iotMonitoringService } from "@/features/iot-monitoring/services/iot-monitoring.service";
import type { AlertSummary } from "@/features/alerts/types/alert.types";
import type { HerdOverviewStats } from "@/features/herd/types/goat-batch.types";
import type { CareReminder } from "@/features/herd/types/care.types";
import type { IotMonitoringSnapshot } from "@/features/iot-monitoring/types/iot.types";

export type DashboardData = {
  iot: IotMonitoringSnapshot;
  herdStats: HerdOverviewStats;
  activeAlertCount: number;
  latestAlerts: AlertSummary[];
  upcomingReminders: CareReminder[];
};

export class DashboardService {
  async getDashboard(farmId: string = DEFAULT_FARM_ID): Promise<DashboardData> {
    const [iot, herdStats, activeAlertCount, latestAlerts, upcomingReminders] = await Promise.all([
      iotMonitoringService.getMonitoringSnapshot(farmId, "7d"),
      herdService.getOverviewStats(farmId),
      alertService.countActive(farmId),
      alertService.getLatestAlerts(farmId, 5),
      careReminderService.listUpcoming(farmId, 7),
    ]);
    return { iot, herdStats, activeAlertCount, latestAlerts, upcomingReminders };
  }
}

export const dashboardService = new DashboardService();

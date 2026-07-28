import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createAlertRepository } from "../repositories/create-alert.repository";
import { mapAlertToSummary } from "../mappers/alert.mapper";
import type { Alert, AlertListFilter, AlertSummary } from "../types/alert.types";

export class AlertService {
  private readonly repo = createAlertRepository();

  async listAlerts(farmId: string = DEFAULT_FARM_ID, filter?: AlertListFilter): Promise<Alert[]> {
    return this.repo.listAlerts(farmId, filter);
  }

  async getLatestAlerts(farmId: string, limit = 5): Promise<AlertSummary[]> {
    const alerts = await this.repo.listAlerts(farmId, { tab: "all" });
    return alerts
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
      .slice(0, limit)
      .map(mapAlertToSummary);
  }

  async countActive(farmId: string = DEFAULT_FARM_ID): Promise<number> {
    const alerts = await this.repo.listAlerts(farmId, { tab: "active" });
    return alerts.length;
  }

  async markResolved(farmId: string, alertId: string, resolvedAt: string): Promise<Alert> {
    return this.repo.markResolved(farmId, alertId, resolvedAt);
  }
}

export const alertService = new AlertService();

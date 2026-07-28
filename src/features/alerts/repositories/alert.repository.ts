import type { Alert, AlertListFilter } from "../types/alert.types";

export interface AlertRepository {
  listAlerts(farmId: string, filter?: AlertListFilter): Promise<Alert[]>;
  getAlertById(farmId: string, alertId: string): Promise<Alert | null>;
  markResolved(farmId: string, alertId: string, resolvedAt: string): Promise<Alert>;
}

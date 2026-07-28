import type { Alert, AlertRow, AlertSummary } from "../types/alert.types";

export function mapAlertRowToDomain(row: AlertRow, resolvedOverride?: string | null): Alert {
  const resolvedAt = resolvedOverride !== undefined ? resolvedOverride : row.resolved_at;
  return {
    id: row.id,
    farmId: row.farm_id,
    title: row.title,
    message: row.message,
    level: row.level,
    source: row.source,
    alertType: row.alert_type,
    location: row.location,
    measuredValue: row.measured_value,
    thresholdValue: row.threshold_value,
    triggeredAt: row.triggered_at,
    resolvedAt,
    isResolved: resolvedAt !== null,
  };
}

export function mapAlertToSummary(alert: Alert): AlertSummary {
  return {
    id: alert.id,
    title: alert.title,
    level: alert.level,
    triggeredAt: alert.triggeredAt,
    isResolved: alert.isResolved,
    alertType: alert.alertType,
    location: alert.location,
    measuredValue: alert.measuredValue,
    thresholdValue: alert.thresholdValue,
  };
}

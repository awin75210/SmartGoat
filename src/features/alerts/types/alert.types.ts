import type { AlertLevel } from "@/shared/constants/alert-levels";

export type AlertRow = {
  id: string;
  farm_id: string;
  title: string;
  message: string;
  level: AlertLevel;
  source: string;
  alert_type: string;
  location: string;
  measured_value: string | null;
  threshold_value: string | null;
  triggered_at: string;
  resolved_at: string | null;
};

export type Alert = {
  id: string;
  farmId: string;
  title: string;
  message: string;
  level: AlertLevel;
  source: string;
  alertType: string;
  location: string;
  measuredValue: string | null;
  thresholdValue: string | null;
  triggeredAt: string;
  resolvedAt: string | null;
  isResolved: boolean;
};

export type AlertSummary = {
  id: string;
  title: string;
  level: AlertLevel;
  triggeredAt: string;
  isResolved: boolean;
  alertType: string;
  location: string;
  measuredValue: string | null;
  thresholdValue: string | null;
};

export type AlertListFilter = {
  tab: "active" | "resolved" | "all" | "care";
  level?: AlertLevel | "all";
};

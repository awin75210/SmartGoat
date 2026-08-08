import type { IotMetric, IotMetricKey } from "../types/iot.types";
import { formatDateTimeVi } from "@/shared/utils/format";
import { IOT_METRIC_UNITS } from "../constants/iot-device.constants";
import { formatFeedDisplay, formatRainDisplay } from "./iot-metric.utils";

export const IOT_NO_DATA = "_";

export function findIotMetric(
  metrics: IotMetric[],
  key: IotMetricKey,
): IotMetric | undefined {
  return metrics.find((m) => m.metricKey === key);
}

export function formatIotMetricValue(metric: IotMetric | undefined): string {
  if (!metric) return IOT_NO_DATA;
  if (metric.metricKey === "temperature") return metric.value.toFixed(1);
  if (metric.metricKey === "rain") return formatRainDisplay(metric.value);
  if (metric.metricKey === "feedLevel") return formatFeedDisplay(metric.value);
  return String(Math.round(metric.value * 10) / 10);
}

export function formatIotMetricUnit(metric: IotMetric | undefined, key: IotMetricKey): string | undefined {
  if (!metric) return undefined;
  if (key === "rain" || key === "feedLevel") return undefined;
  return metric.unit || IOT_METRIC_UNITS[key as keyof typeof IOT_METRIC_UNITS];
}

export function formatIotRecordedAt(metric: IotMetric | undefined): string | undefined {
  if (!metric?.recordedAt) return undefined;
  return formatDateTimeVi(metric.recordedAt);
}

export function formatIotRecordedAtHint(metric: IotMetric | undefined): string {
  const at = formatIotRecordedAt(metric);
  return at ? `Cập nhật: ${at}` : "Chưa có dữ liệu từ ESP32";
}

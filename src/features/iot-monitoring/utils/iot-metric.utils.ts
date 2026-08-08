import { formatDateTimeVi } from "@/shared/utils/format";
import {
  IOT_METRIC_UNITS,
  IOT_SENSOR_METRICS,
  type IotSensorMetricKey,
} from "../constants/iot-device.constants";
import type { IotMetric, IotMetricKey } from "../types/iot.types";

const IDEAL_RANGES: Record<IotSensorMetricKey, string> = {
  temperature: "22–28°C",
  humidity: "55–75%",
  toxicGas: "< 15 ppm",
  feedLevel: "30–70%",
  rain: "Khô (0) / Mưa (1)",
  light: "100–300 lux",
};

export function evaluateMetricStatus(key: IotSensorMetricKey, value: number): string {
  switch (key) {
    case "temperature":
      if (value < 18) return "Lạnh";
      if (value > 30) return "Nóng";
      return "Ổn định";
    case "humidity":
      if (value < 45) return "Thấp";
      if (value > 80) return "Cao";
      return "Phù hợp";
    case "toxicGas":
      if (value >= 15) return "Cảnh báo";
      if (value >= 10) return "Theo dõi";
      return "An toàn";
    case "feedLevel":
      if (value < 20) return "Sắp hết";
      if (value > 85) return "Đầy";
      return "Đủ";
    case "rain":
      return value >= 1 ? "Đang mưa" : "Khô";
    case "light":
      if (value < 50) return "Thiếu sáng";
      if (value > 400) return "Quá sáng";
      return "Lý tưởng";
    default:
      return "—";
  }
}

export function buildMetricFromReading(params: {
  id: string;
  farmId: string;
  metricKey: IotSensorMetricKey;
  value: number;
  recordedAt: string;
}): IotMetric {
  return {
    id: params.id,
    farmId: params.farmId,
    metricKey: params.metricKey,
    value: params.value,
    unit: IOT_METRIC_UNITS[params.metricKey],
    statusLabel: evaluateMetricStatus(params.metricKey, params.value),
    idealRange: IDEAL_RANGES[params.metricKey],
    trendLabel: formatDateTimeVi(params.recordedAt),
    recordedAt: params.recordedAt,
  };
}

export function emptySparklines(): Record<IotMetricKey, { value: number; recordedAt: string }[]> {
  const result = {} as Record<IotMetricKey, { value: number; recordedAt: string }[]>;
  for (const key of [...IOT_SENSOR_METRICS, "ammonia"] as IotMetricKey[]) {
    result[key] = [];
  }
  return result;
}

export function formatRainDisplay(value: number): string {
  return value >= 1 ? "Có mưa" : "Khô";
}

export function formatFeedDisplay(value: number): string {
  return `${Math.round(value)}%`;
}

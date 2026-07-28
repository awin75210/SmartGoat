import { formatDateVi } from "@/shared/utils/format";
import type {
  BarnStatus,
  BarnStatusRow,
  IotChartPoint,
  IotChartPointRow,
  IotEnvironmentSummary,
  IotEnvironmentSummaryRow,
  IotMetric,
  IotMetricRow,
  IotSparklinePoint,
  IotSparklinePointRow,
} from "../types/iot.types";

export function mapIotMetricRowToDomain(row: IotMetricRow): IotMetric {
  return {
    id: row.id,
    farmId: row.farm_id,
    metricKey: row.metric_key,
    value: row.value,
    unit: row.unit,
    statusLabel: row.status_label,
    idealRange: row.ideal_range,
    trendLabel: row.trend_label,
    recordedAt: row.recorded_at,
  };
}

export function mapEnvironmentSummaryRowToDomain(
  row: IotEnvironmentSummaryRow,
): IotEnvironmentSummary {
  return {
    healthPercent: row.health_percent,
    healthLabel: row.health_label,
    ventilationStatus: row.ventilation_status,
    floorStatus: row.floor_status,
    sensorsStatus: row.sensors_status,
  };
}

export function mapIotChartRowToDomain(row: IotChartPointRow): IotChartPoint {
  return {
    id: row.id,
    recordedAt: row.recorded_at,
    label: formatDateVi(row.recorded_at),
    temperatureC: row.temperature_c,
    humidityPct: row.humidity_pct,
    ammoniaPpm: row.ammonia_ppm,
    lightLux: row.light_lux,
  };
}

export function mapSparklineRowToDomain(row: IotSparklinePointRow): IotSparklinePoint {
  return {
    value: row.value,
    recordedAt: row.recorded_at,
  };
}

export function mapBarnStatusRowToDomain(row: BarnStatusRow): BarnStatus {
  return {
    id: row.id,
    barnName: row.barn_name,
    occupancy: row.occupancy,
    capacity: row.capacity,
    ventilation: row.ventilation,
    lastCleanedAt: row.last_cleaned_at,
    status: row.status,
  };
}

import { formatDateVi } from "@/shared/utils/format";
import type {
  FarmReport,
  ReportChartPoint,
  ReportChartRow,
  ReportMetric,
  ReportMetricRow,
} from "../types/report.types";

export function mapReportMetricRow(row: ReportMetricRow): ReportMetric {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    unit: row.unit,
  };
}

export function mapReportChartRow(row: ReportChartRow): ReportChartPoint {
  return {
    id: row.id,
    label: formatDateVi(row.recorded_at),
    avgTemperatureC: row.avg_temperature_c,
    avgHumidityPct: row.avg_humidity_pct,
    alertCount: row.alert_count,
  };
}

export function buildFarmReport(
  metrics: ReportMetric[],
  chartSeries: ReportChartPoint[],
  generatedAt: string,
  period: FarmReport["period"],
): FarmReport {
  return { period, metrics, chartSeries, generatedAt };
}

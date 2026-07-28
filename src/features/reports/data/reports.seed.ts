import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import type { ReportChartRow, ReportMetricRow, ReportPeriod } from "../types/report.types";

const CHART_DAYS = [
  "2025-07-15T08:00:00.000Z",
  "2025-07-16T08:00:00.000Z",
  "2025-07-17T08:00:00.000Z",
  "2025-07-18T08:00:00.000Z",
  "2025-07-19T08:00:00.000Z",
  "2025-07-20T08:00:00.000Z",
  "2025-07-21T08:00:00.000Z",
];

export const REPORT_METRICS_SEED: ReportMetricRow[] = [
  {
    id: "rm-1",
    farm_id: DEFAULT_FARM_ID,
    period: "7d",
    label: "Cảnh báo đã xử lý",
    value: 4,
    unit: "sự kiện",
  },
  {
    id: "rm-2",
    farm_id: DEFAULT_FARM_ID,
    period: "7d",
    label: "Nhiệt độ trung bình",
    value: 24.2,
    unit: "°C",
  },
  {
    id: "rm-3",
    farm_id: DEFAULT_FARM_ID,
    period: "7d",
    label: "Tỷ lệ khỏe mạnh",
    value: 77,
    unit: "%",
  },
];

export const REPORT_CHART_SEED: ReportChartRow[] = CHART_DAYS.map((recorded_at, i) => ({
  id: `rc-${i}`,
  farm_id: DEFAULT_FARM_ID,
  recorded_at,
  avg_temperature_c: [23.5, 24, 24.5, 24, 25, 24.1, 24.2][i] ?? 24,
  avg_humidity_pct: [66, 67, 69, 68, 70, 67, 68][i] ?? 68,
  alert_count: [1, 0, 2, 1, 3, 1, 2][i] ?? 0,
}));

export const REPORT_PERIODS: ReportPeriod[] = ["7d", "30d", "90d"];

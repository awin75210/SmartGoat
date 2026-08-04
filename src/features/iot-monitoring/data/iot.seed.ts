import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import type {
  BarnStatusRow,
  IotChartPointRow,
  IotEnvironmentSummaryRow,
  IotMetricKey,
  IotMetricRow,
  IotSparklinePointRow,
} from "../types/iot.types";

const CHART_DAYS = [
  "2025-07-15T08:00:00.000Z",
  "2025-07-16T08:00:00.000Z",
  "2025-07-17T08:00:00.000Z",
  "2025-07-18T08:00:00.000Z",
  "2025-07-19T08:00:00.000Z",
  "2025-07-20T08:00:00.000Z",
  "2025-07-21T08:00:00.000Z",
];

export const IOT_METRICS_SEED: IotMetricRow[] = [
  {
    id: "iot-m-temp",
    farm_id: DEFAULT_FARM_ID,
    metric_key: "temperature",
    value: 24,
    unit: "°C",
    status_label: "Ổn định",
    ideal_range: "22–28°C",
    trend_label: "+0.8°C so với hôm qua",
    recorded_at: SEED_REFERENCE_ISO,
  },
  {
    id: "iot-m-hum",
    farm_id: DEFAULT_FARM_ID,
    metric_key: "humidity",
    value: 68,
    unit: "%",
    status_label: "Phù hợp",
    ideal_range: "55–75%",
    trend_label: "+2% so với hôm qua",
    recorded_at: SEED_REFERENCE_ISO,
  },
  {
    id: "iot-m-toxic",
    farm_id: DEFAULT_FARM_ID,
    metric_key: "toxicGas",
    value: 8,
    unit: "ppm",
    status_label: "An toàn",
    ideal_range: "< 15 ppm",
    trend_label: "−1 ppm so với hôm qua",
    recorded_at: SEED_REFERENCE_ISO,
  },
  {
    id: "iot-m-feed",
    farm_id: DEFAULT_FARM_ID,
    metric_key: "feedLevel",
    value: 55,
    unit: "%",
    status_label: "Đủ",
    ideal_range: "30–70%",
    trend_label: "Realtime",
    recorded_at: SEED_REFERENCE_ISO,
  },
  {
    id: "iot-m-rain",
    farm_id: DEFAULT_FARM_ID,
    metric_key: "rain",
    value: 0,
    unit: "",
    status_label: "Khô",
    ideal_range: "Khô (0) / Mưa (1)",
    trend_label: "Realtime",
    recorded_at: SEED_REFERENCE_ISO,
  },
  {
    id: "iot-m-light",
    farm_id: DEFAULT_FARM_ID,
    metric_key: "light",
    value: 120,
    unit: "lux",
    status_label: "Lý tưởng",
    ideal_range: "100–300 lux",
    trend_label: "+10 lux so với hôm qua",
    recorded_at: SEED_REFERENCE_ISO,
  },
];

export const IOT_ENVIRONMENT_SUMMARY_SEED: IotEnvironmentSummaryRow = {
  farm_id: DEFAULT_FARM_ID,
  health_percent: 92,
  health_label: "Rất tốt",
  ventilation_status: "Tốt",
  floor_status: "Tốt",
  sensors_status: "Hoạt động",
};

export const IOT_CHART_SEED: IotChartPointRow[] = CHART_DAYS.map((recorded_at, i) => ({
  id: `iot-chart-${i}`,
  farm_id: DEFAULT_FARM_ID,
  recorded_at,
  temperature_c: [23, 24, 25, 24, 26, 24, 24][i] ?? 24,
  humidity_pct: [65, 67, 70, 68, 69, 66, 68][i] ?? 68,
  toxic_gas_ppm: [7, 8, 9, 8, 10, 8, 8][i] ?? 8,
  light_lux: [110, 115, 125, 118, 130, 122, 120][i] ?? 120,
}));

export const IOT_SPARKLINE_SEED: IotSparklinePointRow[] = (
  [
    "temperature",
    "humidity",
    "toxicGas",
    "feedLevel",
    "rain",
    "light",
  ] as IotMetricKey[]
).flatMap((metric_key, ki) =>
  CHART_DAYS.map((recorded_at, i) => ({
    id: `sp-${metric_key}-${i}`,
    farm_id: DEFAULT_FARM_ID,
    metric_key,
    value: [22, 64, 8, 50, 0, 100][ki]! + (i % 4) + ki,
    recorded_at,
  })),
);

export const IOT_HERD_DISPLAY_SUMMARY = {
  total: 48,
  monitoring: 3,
  newKids: 2,
} as const;

export const BARN_STATUS_SEED: BarnStatusRow[] = [
  {
    id: "barn-a",
    farm_id: DEFAULT_FARM_ID,
    barn_name: "Chuồng A",
    occupancy: 18,
    capacity: 24,
    ventilation: "Quạt thông gió tự động",
    last_cleaned_at: "2025-07-20T06:00:00.000Z",
    status: "normal",
  },
  {
    id: "barn-b",
    farm_id: DEFAULT_FARM_ID,
    barn_name: "Chuồng B",
    occupancy: 22,
    capacity: 24,
    ventilation: "Cửa sổ + quạt hút",
    last_cleaned_at: "2025-07-19T07:30:00.000Z",
    status: "attention",
  },
];

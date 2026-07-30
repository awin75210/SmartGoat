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

const METRIC_KEYS: IotMetricKey[] = ["temperature", "humidity", "airQuality", "light", "ammonia"];

type FarmIotProfile = {
  label: string;
  metrics: { key: IotMetricKey; value: number; status: string; trend: string }[];
  healthPercent: number;
  healthLabel: string;
  herd: { total: number; monitoring: number; newKids: number };
  barns: { name: string; occupancy: number; capacity: number; status: "normal" | "attention" }[];
  chartOffsets: { temp: number; hum: number; nh3: number; light: number };
};

const FARM_PROFILES: Record<string, FarmIotProfile> = {
  "farm-capracare-001": {
    label: "CapraCare",
    metrics: [
      { key: "temperature", value: 24, status: "Ổn định", trend: "+0.8°C so với hôm qua" },
      { key: "humidity", value: 68, status: "Phù hợp", trend: "+2% so với hôm qua" },
      { key: "airQuality", value: 32, status: "Tốt", trend: "Ổn định" },
      { key: "light", value: 120, status: "Lý tưởng", trend: "+10 lux so với hôm qua" },
      { key: "ammonia", value: 8, status: "An toàn", trend: "−1 ppm so với hôm qua" },
    ],
    healthPercent: 92,
    healthLabel: "Rất tốt",
    herd: { total: 48, monitoring: 3, newKids: 2 },
    barns: [
      { name: "Chuồng A", occupancy: 18, capacity: 24, status: "normal" },
      { name: "Chuồng B", occupancy: 22, capacity: 24, status: "attention" },
    ],
    chartOffsets: { temp: 0, hum: 0, nh3: 0, light: 0 },
  },
  "farm-capracare-002": {
    label: "Bình An",
    metrics: [
      { key: "temperature", value: 27, status: "Hơi cao", trend: "+1.2°C so với hôm qua" },
      { key: "humidity", value: 72, status: "Ẩm", trend: "+3% so với hôm qua" },
      { key: "airQuality", value: 45, status: "Khá", trend: "+5 AQI so với hôm qua" },
      { key: "light", value: 95, status: "Đủ sáng", trend: "−5 lux so với hôm qua" },
      { key: "ammonia", value: 11, status: "Theo dõi", trend: "+2 ppm so với hôm qua" },
    ],
    healthPercent: 78,
    healthLabel: "Khá",
    herd: { total: 40, monitoring: 5, newKids: 1 },
    barns: [
      { name: "Chuồng chính", occupancy: 28, capacity: 35, status: "normal" },
      { name: "Chuồng dê con", occupancy: 12, capacity: 15, status: "normal" },
    ],
    chartOffsets: { temp: 3, hum: 4, nh3: 3, light: -10 },
  },
};

function defaultProfile(farmId: string, farmName?: string): FarmIotProfile {
  const seed = farmId.length + (farmName?.length ?? 0);
  const baseTemp = 23 + (seed % 5);
  return {
    label: farmName ?? farmId,
    metrics: [
      { key: "temperature", value: baseTemp, status: "Ổn định", trend: "Mới cấp thiết bị" },
      { key: "humidity", value: 60 + (seed % 10), status: "Phù hợp", trend: "Mới cấp thiết bị" },
      { key: "airQuality", value: 35 + (seed % 15), status: "Tốt", trend: "Mới cấp thiết bị" },
      { key: "light", value: 100 + (seed % 30), status: "Lý tưởng", trend: "Mới cấp thiết bị" },
      { key: "ammonia", value: 6 + (seed % 6), status: "An toàn", trend: "Mới cấp thiết bị" },
    ],
    healthPercent: 85 + (seed % 10),
    healthLabel: "Tốt",
    herd: { total: 0, monitoring: 0, newKids: 0 },
    barns: [{ name: "Chuồng A", occupancy: 0, capacity: 20, status: "normal" }],
    chartOffsets: { temp: seed % 3, hum: seed % 4, nh3: seed % 2, light: seed % 5 },
  };
}

const METRIC_META: Record<
  IotMetricKey,
  { unit: string; ideal: string }
> = {
  temperature: { unit: "°C", ideal: "22–28°C" },
  humidity: { unit: "%", ideal: "55–75%" },
  airQuality: { unit: "AQI", ideal: "AQI < 50" },
  light: { unit: "lux", ideal: "100–300 lux" },
  ammonia: { unit: "ppm", ideal: "< 15 ppm" },
};

export type FarmIotBundle = {
  metrics: IotMetricRow[];
  sparklines: IotSparklinePointRow[];
  chart: IotChartPointRow[];
  barns: BarnStatusRow[];
  environment: IotEnvironmentSummaryRow;
  herd: { total: number; monitoring: number; newKids: number };
};

export function buildFarmIotBundle(farmId: string, farmName?: string, nowIso = SEED_REFERENCE_ISO): FarmIotBundle {
  const profile = FARM_PROFILES[farmId] ?? defaultProfile(farmId, farmName);
  const slug = farmId.replace(/[^a-z0-9]/gi, "").slice(-8) || "farm";

  const metrics: IotMetricRow[] = profile.metrics.map((m) => ({
    id: `iot-m-${slug}-${m.key}`,
    farm_id: farmId,
    metric_key: m.key,
    value: m.value,
    unit: METRIC_META[m.key].unit,
    status_label: m.status,
    ideal_range: METRIC_META[m.key].ideal,
    trend_label: m.trend,
    recorded_at: nowIso,
  }));

  const chart: IotChartPointRow[] = CHART_DAYS.map((recorded_at, i) => ({
    id: `iot-chart-${slug}-${i}`,
    farm_id: farmId,
    recorded_at,
    temperature_c: [23, 24, 25, 24, 26, 24, 24][i]! + profile.chartOffsets.temp,
    humidity_pct: [65, 67, 70, 68, 69, 66, 68][i]! + profile.chartOffsets.hum,
    ammonia_ppm: [7, 8, 9, 8, 10, 8, 8][i]! + profile.chartOffsets.nh3,
    light_lux: [110, 115, 125, 118, 130, 122, 120][i]! + profile.chartOffsets.light,
  }));

  const sparklines: IotSparklinePointRow[] = METRIC_KEYS.flatMap((metric_key, ki) =>
    CHART_DAYS.map((recorded_at, i) => ({
      id: `sp-${slug}-${metric_key}-${i}`,
      farm_id: farmId,
      metric_key,
      value: profile.metrics[ki]?.value ?? 20 + (i % 4) + ki,
      recorded_at,
    })),
  );

  const barns: BarnStatusRow[] = profile.barns.map((barn, i) => ({
    id: `barn-${slug}-${i}`,
    farm_id: farmId,
    barn_name: barn.name,
    occupancy: barn.occupancy,
    capacity: barn.capacity,
    ventilation: "Quạt thông gió tự động",
    last_cleaned_at: "2025-07-20T06:00:00.000Z",
    status: barn.status,
  }));

  const environment: IotEnvironmentSummaryRow = {
    farm_id: farmId,
    health_percent: profile.healthPercent,
    health_label: profile.healthLabel,
    ventilation_status: profile.healthPercent >= 85 ? "Tốt" : "Theo dõi",
    floor_status: profile.healthPercent >= 80 ? "Tốt" : "Cần dọn",
    sensors_status: "Hoạt động",
  };

  return {
    metrics,
    sparklines,
    chart,
    barns,
    environment,
    herd: profile.herd,
  };
}

export function buildInitialIotStores(): {
  metrics: IotMetricRow[];
  sparklines: IotSparklinePointRow[];
  chart: IotChartPointRow[];
  barns: BarnStatusRow[];
  environments: IotEnvironmentSummaryRow[];
  herds: Record<string, { total: number; monitoring: number; newKids: number }>;
} {
  const farmIds = ["farm-capracare-001", "farm-capracare-002"];
  const metrics: IotMetricRow[] = [];
  const sparklines: IotSparklinePointRow[] = [];
  const chart: IotChartPointRow[] = [];
  const barns: BarnStatusRow[] = [];
  const environments: IotEnvironmentSummaryRow[] = [];
  const herds: Record<string, { total: number; monitoring: number; newKids: number }> = {};

  for (const farmId of farmIds) {
    const bundle = buildFarmIotBundle(farmId);
    metrics.push(...bundle.metrics);
    sparklines.push(...bundle.sparklines);
    chart.push(...bundle.chart);
    barns.push(...bundle.barns);
    environments.push(bundle.environment);
    herds[farmId] = bundle.herd;
  }

  return { metrics, sparklines, chart, barns, environments, herds };
}

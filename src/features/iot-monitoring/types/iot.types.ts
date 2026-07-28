export type IotTimeRange = "24h" | "7d" | "30d";

export type IotMetricKey =
  | "temperature"
  | "humidity"
  | "airQuality"
  | "light"
  | "ammonia";

export type IotMetricRow = {
  id: string;
  farm_id: string;
  metric_key: IotMetricKey;
  value: number;
  unit: string;
  status_label: string;
  ideal_range: string;
  trend_label: string;
  recorded_at: string;
};

export type IotSparklinePointRow = {
  id: string;
  farm_id: string;
  metric_key: IotMetricKey;
  value: number;
  recorded_at: string;
};

export type IotChartPointRow = {
  id: string;
  farm_id: string;
  recorded_at: string;
  temperature_c: number;
  humidity_pct: number;
  ammonia_ppm: number;
  light_lux: number;
};

export type BarnStatusRow = {
  id: string;
  farm_id: string;
  barn_name: string;
  occupancy: number;
  capacity: number;
  ventilation: string;
  last_cleaned_at: string;
  status: "normal" | "attention" | "critical";
};

export type IotMetric = {
  id: string;
  farmId: string;
  metricKey: IotMetricKey;
  value: number;
  unit: string;
  statusLabel: string;
  idealRange: string;
  trendLabel: string;
  recordedAt: string;
};

export type IotEnvironmentSummaryRow = {
  farm_id: string;
  health_percent: number;
  health_label: string;
  ventilation_status: string;
  floor_status: string;
  sensors_status: string;
};

export type IotEnvironmentSummary = {
  healthPercent: number;
  healthLabel: string;
  ventilationStatus: string;
  floorStatus: string;
  sensorsStatus: string;
};

export type IotSparklinePoint = {
  value: number;
  recordedAt: string;
};

export type IotChartPoint = {
  id: string;
  recordedAt: string;
  label: string;
  temperatureC: number;
  humidityPct: number;
  ammoniaPpm: number;
  lightLux: number;
};

export type BarnStatus = {
  id: string;
  barnName: string;
  occupancy: number;
  capacity: number;
  ventilation: string;
  lastCleanedAt: string;
  status: "normal" | "attention" | "critical";
};

export type IotMonitoringSnapshot = {
  metrics: IotMetric[];
  sparklines: Record<IotMetricKey, IotSparklinePoint[]>;
  chartSeries: IotChartPoint[];
  barnStatus: BarnStatus[];
  environmentSummary: IotEnvironmentSummary;
  range: IotTimeRange;
};

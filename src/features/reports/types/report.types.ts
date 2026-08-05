export type ReportPeriod = "7d" | "30d" | "90d";

export type ReportMetricRow = {
  id: string;
  farm_id: string;
  period: ReportPeriod;
  label: string;
  value: number;
  unit: string;
};

export type ReportChartRow = {
  id: string;
  farm_id: string;
  recorded_at: string;
  avg_temperature_c: number;
  avg_humidity_pct: number;
  alert_count: number;
};

export type ReportMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
};

export type ReportChartPoint = {
  id: string;
  label: string;
  avgTemperatureC: number;
  avgHumidityPct: number;
  alertCount: number;
};

export type FarmReport = {
  period: ReportPeriod;
  metrics: ReportMetric[];
  chartSeries: ReportChartPoint[];
  generatedAt: string;
};

export type ExportReportResult = {
  fileName: string;
  status: "csv" | "stub";
  message: string;
  csv?: string;
};

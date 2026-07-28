import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import { REPORT_CHART_SEED, REPORT_METRICS_SEED } from "../data/reports.seed";
import {
  buildFarmReport,
  mapReportChartRow,
  mapReportMetricRow,
} from "../mappers/report.mapper";
import type { ReportPeriod } from "../types/report.types";
import type { ReportRepository } from "./report.repository";

export class SeedReportRepository implements ReportRepository {
  async getFarmReport(farmId: string, period: ReportPeriod) {
    const metrics = REPORT_METRICS_SEED.filter((r) => r.farm_id === farmId && r.period === "7d").map(
      mapReportMetricRow,
    );
    const chartSeries = REPORT_CHART_SEED.filter((r) => r.farm_id === farmId).map(
      mapReportChartRow,
    );
    return buildFarmReport(metrics, chartSeries, SEED_REFERENCE_ISO, period);
  }

  async exportReportStub(farmId: string, period: ReportPeriod) {
    return {
      fileName: `capracare-report-${farmId}-${period}.pdf`,
      status: "stub" as const,
      message: "Chức năng sẽ được cập nhật",
    };
  }
}

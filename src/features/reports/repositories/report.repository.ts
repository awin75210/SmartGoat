import type { ExportReportResult, FarmReport, ReportPeriod } from "../types/report.types";

export interface ReportRepository {
  getFarmReport(farmId: string, period: ReportPeriod): Promise<FarmReport>;
  exportReportStub(farmId: string, period: ReportPeriod): Promise<ExportReportResult>;
}

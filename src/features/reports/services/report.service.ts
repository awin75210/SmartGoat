import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createReportRepository } from "../repositories/create-report.repository";
import type { ExportReportResult, FarmReport, ReportPeriod } from "../types/report.types";

export class ReportService {
  private readonly repo = createReportRepository();

  async getFarmReport(
    farmId: string = DEFAULT_FARM_ID,
    period: ReportPeriod = "7d",
  ): Promise<FarmReport> {
    return this.repo.getFarmReport(farmId, period);
  }

  async exportReport(
    farmId: string = DEFAULT_FARM_ID,
    period: ReportPeriod = "7d",
  ): Promise<ExportReportResult> {
    return this.repo.exportReportStub(farmId, period);
  }
}

export const reportService = new ReportService();

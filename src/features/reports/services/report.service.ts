import { DEFAULT_FARM_ID } from "@/lib/config/app.config";
import { createReportRepository } from "../repositories/create-report.repository";
import { goatBatchService } from "@/features/herd/services/goat-batch.service";
import { journalService } from "@/features/herd/services/journal.service";
import { herdExportService } from "@/features/herd/services/herd-export.service";
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
    const [batches, journal] = await Promise.all([
      goatBatchService.listBatches(farmId),
      journalService.listEntries(farmId, { limit: 500 }),
    ]);
    const batchCsv = herdExportService.batchesToCsv(batches);
    const journalCsv = herdExportService.journalToCsv(journal);
    const csv = [
      `# Báo cáo trại — ${farmId} — ${period}`,
      "",
      "## Lứa đàn",
      batchCsv,
      "",
      "## Nhật ký",
      journalCsv,
    ].join("\n");
    return {
      fileName: `capracare-report-${farmId}-${period}.csv`,
      status: "csv",
      message: "Đã tạo báo cáo CSV",
      csv,
    };
  }
}

export const reportService = new ReportService();

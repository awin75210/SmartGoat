import { SeedReportRepository } from "./seed-report.repository";
import type { ReportRepository } from "./report.repository";

export function createReportRepository(): ReportRepository {
  return new SeedReportRepository();
}

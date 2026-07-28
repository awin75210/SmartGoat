"use server";

import { requireAuthenticatedFarmContext } from "@/lib/auth/server-context";
import { toActionResult, type ActionResult } from "@/lib/errors/action-result";
import { reportService } from "../services/report.service";
import type { ExportReportResult, ReportPeriod } from "../types/report.types";

export async function exportReportAction(
  period: ReportPeriod = "7d",
): Promise<ActionResult<ExportReportResult>> {
  return toActionResult(async () => {
    const { farmId } = await requireAuthenticatedFarmContext();
    return reportService.exportReport(farmId, period);
  });
}

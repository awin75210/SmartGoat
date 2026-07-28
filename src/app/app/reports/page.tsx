import { requireFarmContext } from "@/lib/auth/server-context";
import { reportService } from "@/features/reports/services/report.service";
import { ReportsPage } from "@/features/reports/components/ReportsPage";

export default async function ReportsRoutePage() {
  const { farmId } = await requireFarmContext();
  const report = await reportService.getFarmReport(farmId, "7d");

  return <ReportsPage report={report} />;
}

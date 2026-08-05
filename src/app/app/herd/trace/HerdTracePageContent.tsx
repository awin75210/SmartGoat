import { requireFarmContext } from "@/lib/auth/server-context";
import { goatBatchService } from "@/features/herd/services/goat-batch.service";
import { herdExportService } from "@/features/herd/services/herd-export.service";
import { TraceabilityPage } from "@/features/herd/components/trace/TraceabilityPage";

type TracePageContentProps = {
  searchParams: Promise<{ code?: string }>;
};

export async function HerdTracePageContent({ searchParams }: TracePageContentProps) {
  const { code } = await searchParams;
  const { farmId } = await requireFarmContext();

  let batch = null;
  let report = null;

  if (code?.trim()) {
    batch = await goatBatchService.getBatchByCode(farmId, code.trim());
    if (batch) {
      report = await herdExportService.buildTraceabilityReport(farmId, batch.id);
    }
  }

  return <TraceabilityPage initialCode={code ?? ""} batch={batch} report={report} />;
}

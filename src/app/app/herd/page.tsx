import { requireFarmContext } from "@/lib/auth/server-context";
import { barnService } from "@/features/herd/services/barn.service";
import { herdService } from "@/features/herd/services/herd.service";
import { HerdPage } from "@/features/herd/components/HerdPage";

export default async function HerdRoutePage() {
  const { farmId } = await requireFarmContext();
  const [barns, batches, stats] = await Promise.all([
    barnService.listBarns(farmId),
    herdService.listBatches(farmId),
    herdService.getOverviewStats(farmId),
  ]);

  return <HerdPage barns={barns} batches={batches} stats={stats} />;
}

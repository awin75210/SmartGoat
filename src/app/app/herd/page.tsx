import { requireFarmContext } from "@/lib/auth/server-context";
import { herdService } from "@/features/herd/services/herd.service";
import { HerdPage } from "@/features/herd/components/HerdPage";

export default async function HerdRoutePage() {
  const { farmId } = await requireFarmContext();
  const [goats, stats] = await Promise.all([
    herdService.listGoats(farmId),
    herdService.getOverviewStats(farmId),
  ]);

  return <HerdPage goats={goats} stats={stats} />;
}

import { requireFarmContext } from "@/lib/auth/server-context";
import { alertService } from "@/features/alerts/services/alert.service";
import { AlertsPage } from "@/features/alerts/components/AlertsPage";

export default async function AlertsRoutePage() {
  const { farmId } = await requireFarmContext();
  const alerts = await alertService.listAlerts(farmId);

  return <AlertsPage initialAlerts={alerts} />;
}

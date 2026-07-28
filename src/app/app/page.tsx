import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";

export default async function AppDashboardPage() {
  const session = await resolveAppSession();
  const { farmId } = await requireFarmContext();
  const data = await dashboardService.getDashboard(farmId);

  return (
    <DashboardPage
      data={data}
      userName={session.isGuest ? undefined : session.fullName}
      guestHint={session.isGuest}
    />
  );
}

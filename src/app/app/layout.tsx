import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { adminService } from "@/features/admin/services/admin.service";
import { alertService } from "@/features/alerts/services/alert.service";
import { FarmAppLayout } from "@/shared/components/AppShell/FarmAppLayout";

export default async function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await resolveAppSession();
  const { farmId, isGuest } = await requireFarmContext();
  const [farm, alertCount] = await Promise.all([
    adminService.getFarmById(farmId),
    alertService.countActive(farmId),
  ]);

  return (
    <FarmAppLayout
      userName={session.fullName}
      farmName={farm?.name ?? "Trang trại"}
      notificationCount={alertCount}
      isGuest={isGuest}
    >
      {children}
    </FarmAppLayout>
  );
}

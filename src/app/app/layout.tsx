import { Suspense } from "react";
import { requireFarmContext, resolveAppSession } from "@/lib/auth/server-context";
import { adminService } from "@/features/admin/services/admin.service";
import { alertService } from "@/features/alerts/services/alert.service";
import { FarmAppLayout } from "@/shared/components/AppShell/FarmAppLayout";
import { AppRouteFallback } from "@/shared/components/AppRouteFallback/AppRouteFallback";

export default async function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await resolveAppSession();
  const { farmId } = await requireFarmContext();
  const [farm, alertCount] = await Promise.all([
    adminService.getFarmById(farmId),
    alertService.countActive(farmId),
  ]);

  return (
    <FarmAppLayout
      userName={session.fullName}
      farmName={farm?.name ?? "Trang trại"}
      notificationCount={alertCount}
    >
      <Suspense fallback={<AppRouteFallback />}>{children}</Suspense>
    </FarmAppLayout>
  );
}

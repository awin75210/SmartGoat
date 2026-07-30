import { notFound } from "next/navigation";
import { adminService } from "@/features/admin/services/admin.service";
import { AdminFarmDetailPage } from "@/features/admin/components/AdminFarmDetailPage";

type PageProps = {
  params: Promise<{ farmId: string }>;
};

export default async function AdminFarmDetailRoutePage({ params }: PageProps) {
  const { farmId } = await params;
  const [farm, devices] = await Promise.all([
    adminService.getFarmById(farmId),
    adminService.listDevices(farmId),
  ]);

  if (!farm) {
    notFound();
  }

  return <AdminFarmDetailPage farm={farm} devices={devices} />;
}

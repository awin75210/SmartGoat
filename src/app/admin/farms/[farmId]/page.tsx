import { notFound } from "next/navigation";
import { adminService } from "@/features/admin/services/admin.service";
import { AdminFarmDetailPage } from "@/features/admin/components/AdminFarmDetailPage";
import { barnService } from "@/features/herd/services/barn.service";
import { goatBatchService } from "@/features/herd/services/goat-batch.service";

type PageProps = {
  params: Promise<{ farmId: string }>;
};

export default async function AdminFarmDetailRoutePage({ params }: PageProps) {
  const { farmId } = await params;
  const [farm, devices, barns, batches] = await Promise.all([
    adminService.getFarmById(farmId),
    adminService.listDevices(farmId),
    barnService.listBarns(farmId),
    goatBatchService.listBatches(farmId),
  ]);

  if (!farm) {
    notFound();
  }

  return (
    <AdminFarmDetailPage farm={farm} devices={devices} barns={barns} batches={batches} />
  );
}

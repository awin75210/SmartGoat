import { adminService } from "@/features/admin/services/admin.service";
import { AdminFarmsPage } from "@/features/admin/components/AdminFarmsPage";

export default async function AdminFarmsRoutePage() {
  const farms = await adminService.listFarms();

  return <AdminFarmsPage farms={farms} />;
}

import { adminService } from "@/features/admin/services/admin.service";
import { AdminDashboardPage } from "@/features/admin/components/AdminDashboardPage";

export default async function AdminHomePage() {
  const stats = await adminService.getDashboardStats();

  return <AdminDashboardPage stats={stats} />;
}

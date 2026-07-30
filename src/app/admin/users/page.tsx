import { adminService } from "@/features/admin/services/admin.service";
import { AdminUsersPage } from "@/features/admin/components/AdminUsersPage";

export default async function AdminUsersRoutePage() {
  const [users, farms] = await Promise.all([
    adminService.listUsers(),
    adminService.listFarms(),
  ]);

  return <AdminUsersPage users={users} farms={farms} />;
}

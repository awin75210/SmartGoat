import { adminService } from "@/features/admin/services/admin.service";
import { AdminUsersPage } from "@/features/admin/components/AdminUsersPage";

export default async function AdminUsersRoutePage() {
  const users = await adminService.listUsers();

  return <AdminUsersPage users={users} />;
}

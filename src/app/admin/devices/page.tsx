import { adminService } from "@/features/admin/services/admin.service";
import { AdminDevicesPage } from "@/features/admin/components/AdminDevicesPage";

export default async function AdminDevicesRoutePage() {
  const devices = await adminService.listDevices();

  return <AdminDevicesPage devices={devices} />;
}

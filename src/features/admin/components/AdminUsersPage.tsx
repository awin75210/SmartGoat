import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import type { AdminUser, Farm } from "../types/admin.types";
import styles from "./AdminUsersPage.module.css";

type AdminUsersPageProps = {
  users: AdminUser[];
  farms: Farm[];
};

export function AdminUsersPage({ users, farms }: AdminUsersPageProps) {
  const farmNameById = new Map(farms.map((f) => [f.id, f.name]));

  return (
    <div className={styles.page}>
      <PageHeader
        title="Người dùng hệ thống"
        description="Chủ trại được gán một trang trại — mỗi trại có IoT và dữ liệu riêng."
      />
      <ResponsiveDataView
        data={users}
        getRowKey={(user) => user.id}
        columns={[
          { key: "name", header: "Họ tên", render: (user) => user.fullName },
          { key: "email", header: "Email", render: (user) => user.email },
          {
            key: "role",
            header: "Vai trò",
            render: (user) => (user.role === "admin" ? "Quản trị" : "Chủ trại"),
          },
          {
            key: "farm",
            header: "Trang trại",
            render: (user) =>
              user.farmId ? (farmNameById.get(user.farmId) ?? user.farmId) : "—",
          },
        ]}
        mobileCard={(user) => (
          <>
            <strong>{user.fullName}</strong>
            <div>{user.email}</div>
            <div>
              {user.role === "admin" ? "Quản trị" : "Chủ trại"}
              {user.farmId
                ? ` · ${farmNameById.get(user.farmId) ?? user.farmId}`
                : ""}
            </div>
          </>
        )}
      />
    </div>
  );
}

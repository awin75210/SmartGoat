import { Table, Text } from "@mantine/core";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import type { AdminUser } from "../types/admin.types";
import styles from "./AdminUsersPage.module.css";

type AdminUsersPageProps = {
  users: AdminUser[];
};

export function AdminUsersPage({ users }: AdminUsersPageProps) {
  return (
    <div className={styles.page}>
      <PageHeader title="Người dùng hệ thống" description="Tài khoản truy cập CapraCare" />
      <Table striped highlightOnHover withTableBorder className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Họ tên</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Vai trò</Table.Th>
            <Table.Th>Trang trại</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.fullName}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Text size="sm">{user.role === "admin" ? "Quản trị" : "Chủ trại"}</Text>
              </Table.Td>
              <Table.Td>{user.farmId ?? "—"}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}

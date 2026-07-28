import { SimpleGrid, Stack } from "@mantine/core";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import type { AdminDashboardStats } from "../types/admin.types";
import styles from "./AdminDashboardPage.module.css";

type AdminDashboardPageProps = {
  stats: AdminDashboardStats;
};

export function AdminDashboardPage({ stats }: AdminDashboardPageProps) {
  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader title="Quản trị hệ thống" description="Tổng quan trại và thiết bị trên nền tảng" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <MetricCardShell label="Trại" value={String(stats.farmCount)} />
        <MetricCardShell label="Người dùng" value={String(stats.userCount)} />
        <MetricCardShell label="Thiết bị online" value={String(stats.activeDevices)} />
        <MetricCardShell label="Thiết bị offline" value={String(stats.offlineDevices)} />
      </SimpleGrid>
    </Stack>
  );
}

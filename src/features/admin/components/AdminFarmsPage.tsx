"use client";

import { Stack, Text } from "@mantine/core";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import type { Farm } from "../types/admin.types";
import styles from "./AdminFarmsPage.module.css";

type AdminFarmsPageProps = {
  farms: Farm[];
};

export function AdminFarmsPage({ farms }: AdminFarmsPageProps) {
  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader title="Trang trại" description="Danh sách trại đăng ký CapraCare" />
      <ResponsiveDataView
        data={farms}
        getRowKey={(f) => f.id}
        columns={[
          { key: "name", header: "Tên", render: (f) => f.name },
          { key: "location", header: "Khu vực", render: (f) => f.location },
          { key: "goats", header: "Đàn", render: (f) => String(f.goatCount) },
          { key: "devices", header: "Thiết bị", render: (f) => String(f.deviceCount) },
          {
            key: "status",
            header: "Trạng thái",
            render: (f) => (
              <StatusBadge
                label={f.status === "active" ? "Hoạt động" : "Tạm dừng"}
                color={f.status === "active" ? "#40c057" : "#868e96"}
              />
            ),
          },
        ]}
        mobileCard={(f) => (
          <Stack gap={4}>
            <Text fw={700}>{f.name}</Text>
            <Text size="sm" c="dimmed">
              {f.location} · {f.goatCount} dê
            </Text>
          </Stack>
        )}
      />
    </Stack>
  );
}

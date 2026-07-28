"use client";

import { Stack, Text } from "@mantine/core";
import { formatDateTimeVi } from "@/shared/utils/format";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import type { Device } from "../types/admin.types";
import styles from "./AdminDevicesPage.module.css";

const DEVICE_STATUS: Record<Device["status"], { label: string; color: string }> = {
  online: { label: "Online", color: "#40c057" },
  offline: { label: "Offline", color: "#e8590c" },
  maintenance: { label: "Bảo trì", color: "#fab005" },
};

type AdminDevicesPageProps = {
  devices: Device[];
};

export function AdminDevicesPage({ devices }: AdminDevicesPageProps) {
  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader title="Thiết bị IoT" description="Trạng thái kết nối cảm biến và gateway" />
      <ResponsiveDataView
        data={devices}
        getRowKey={(d) => d.id}
        columns={[
          { key: "name", header: "Tên", render: (d) => d.name },
          { key: "type", header: "Loại", render: (d) => d.deviceType },
          { key: "farm", header: "Trại", render: (d) => d.farmId },
          {
            key: "status",
            header: "Trạng thái",
            render: (d) => {
              const st = DEVICE_STATUS[d.status];
              return <StatusBadge label={st.label} color={st.color} />;
            },
          },
          {
            key: "seen",
            header: "Lần cuối",
            render: (d) => formatDateTimeVi(d.lastSeenAt),
          },
        ]}
        mobileCard={(d) => (
          <Stack gap={4}>
            <Text fw={700}>{d.name}</Text>
            <StatusBadge
              label={DEVICE_STATUS[d.status].label}
              color={DEVICE_STATUS[d.status].color}
            />
          </Stack>
        )}
      />
    </Stack>
  );
}

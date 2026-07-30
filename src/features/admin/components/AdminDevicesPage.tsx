"use client";

import { useMemo, useState } from "react";
import { Select, Stack, Text } from "@mantine/core";
import { formatDateTimeVi } from "@/shared/utils/format";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import type { Device, Farm } from "../types/admin.types";
import styles from "./AdminDevicesPage.module.css";

const DEVICE_STATUS: Record<Device["status"], { label: string; color: string }> = {
  online: { label: "Online", color: "#40c057" },
  offline: { label: "Offline", color: "#e8590c" },
  maintenance: { label: "Bảo trì", color: "#fab005" },
};

type AdminDevicesPageProps = {
  devices: Device[];
  farms: Farm[];
};

export function AdminDevicesPage({ devices, farms }: AdminDevicesPageProps) {
  const [farmFilter, setFarmFilter] = useState<string>("all");

  const farmNameById = useMemo(
    () => new Map(farms.map((f) => [f.id, f.name])),
    [farms],
  );

  const filtered = useMemo(() => {
    if (farmFilter === "all") return devices;
    return devices.filter((d) => d.farmId === farmFilter);
  }, [devices, farmFilter]);

  return (
    <Stack gap="lg" className={styles.page}>
      <PageHeader
        title="Thiết bị IoT"
        description="Mỗi trang trại có bộ cảm biến và gateway riêng — lọc theo trại bên dưới."
      />
      <Select
        label="Lọc theo trang trại"
        data={[
          { value: "all", label: "Tất cả trại" },
          ...farms.map((f) => ({ value: f.id, label: f.name })),
        ]}
        value={farmFilter}
        onChange={(v) => setFarmFilter(v ?? "all")}
        className={styles.farmFilter}
        maw={320}
      />
      <ResponsiveDataView
        data={filtered}
        getRowKey={(d) => d.id}
        columns={[
          { key: "name", header: "Tên", render: (d) => d.name },
          { key: "type", header: "Loại", render: (d) => d.deviceType },
          {
            key: "farm",
            header: "Trang trại",
            render: (d) => farmNameById.get(d.farmId) ?? d.farmId,
          },
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
            <Text size="sm" c="dimmed">
              {farmNameById.get(d.farmId) ?? d.farmId}
            </Text>
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

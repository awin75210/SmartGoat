"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import { formatDateTimeVi } from "@/shared/utils/format";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { deleteFarmAction } from "../actions/admin.actions";
import type { Device, Farm } from "../types/admin.types";
import styles from "./AdminFarmDetailPage.module.css";

const DEVICE_STATUS: Record<Device["status"], { label: string; color: string }> = {
  online: { label: "Hoạt động", color: "#40c057" },
  offline: { label: "Ngắt kết nối", color: "#e8590c" },
  maintenance: { label: "Bảo trì", color: "#fab005" },
};

type AdminFarmDetailPageProps = {
  farm: Farm;
  devices: Device[];
};

export function AdminFarmDetailPage({ farm, devices }: AdminFarmDetailPageProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onlineCount = devices.filter((d) => d.status === "online").length;

  const handleDelete = () => {
    void (async () => {
      setDeleting(true);
      try {
        const result = await deleteFarmAction(farm.id);
        if (!result.ok) {
          notifications.show({ color: "red", message: result.message });
          return;
        }
        notifications.show({ color: "green", message: `Đã xóa ${farm.name}` });
        router.push("/admin/farms");
        router.refresh();
      } finally {
        setDeleting(false);
        setDeleteOpen(false);
      }
    })();
  };

  return (
    <Stack gap="lg" className={styles.page}>
      <Link href="/admin/farms" className={styles.backLink}>
        <IconArrowLeft size={16} stroke={1.5} />
        Quay lại danh sách trại
      </Link>

      <Group justify="space-between" align="flex-start" wrap="wrap">
        <PageHeader
          title={farm.name}
          description={`${farm.location} · Chủ trại: ${farm.ownerEmail} · ${onlineCount}/${devices.length} thiết bị đang hoạt động`}
        />
        <Button
          color="red"
          variant="light"
          leftSection={<IconTrash size={16} />}
          onClick={() => setDeleteOpen(true)}
        >
          Xóa trang trại
        </Button>
      </Group>

      <Paper withBorder radius="md" p="md" className={styles.summary}>
        <Group gap="xl" wrap="wrap">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Trạng thái trại
            </Text>
            <StatusBadge
              label={farm.status === "active" ? "Hoạt động" : "Tạm dừng"}
              color={farm.status === "active" ? "#40c057" : "#868e96"}
            />
          </div>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Số dê
            </Text>
            <Text fw={700}>{farm.goatCount}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Thiết bị IoT
            </Text>
            <Text fw={700}>{devices.length}</Text>
          </div>
        </Group>
      </Paper>

      <Stack gap="sm">
        <Text fw={700}>Thiết bị IoT của trang trại</Text>
        <ResponsiveDataView
          data={devices}
          getRowKey={(d) => d.id}
          emptyState={
            <Text size="sm" c="dimmed">
              Chưa có thiết bị nào được gán cho trang trại này.
            </Text>
          }
          columns={[
            { key: "name", header: "Tên thiết bị", render: (d) => d.name },
            { key: "type", header: "Loại", render: (d) => d.deviceType },
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
              header: "Lần cuối online",
              render: (d) => formatDateTimeVi(d.lastSeenAt),
            },
          ]}
          mobileCard={(d) => (
            <Stack gap={4}>
              <Text fw={700}>{d.name}</Text>
              <Text size="sm" c="dimmed">
                {d.deviceType}
              </Text>
              <StatusBadge
                label={DEVICE_STATUS[d.status].label}
                color={DEVICE_STATUS[d.status].color}
              />
            </Stack>
          )}
        />
      </Stack>

      <ConfirmDialog
        opened={deleteOpen}
        title="Xóa trang trại"
        message={`Bạn có chắc muốn xóa "${farm.name}"? Toàn bộ thiết bị IoT và dữ liệu giám sát demo của trại sẽ bị xóa.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setDeleteOpen(false);
        }}
      />
    </Stack>
  );
}

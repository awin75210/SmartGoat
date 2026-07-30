"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { ActionIcon, Button, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight, IconPlus, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { deleteFarmAction } from "../actions/admin.actions";
import type { Farm } from "../types/admin.types";
import { AdminCreateFarmModal } from "./AdminCreateFarmModal";
import styles from "./AdminFarmsPage.module.css";

type AdminFarmsPageProps = {
  farms: Farm[];
};

export function AdminFarmsPage({ farms }: AdminFarmsPageProps) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteTarget, setDeleteTarget] = useState<Farm | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openFarm = (farm: Farm) => {
    router.push(`/admin/farms/${farm.id}`);
  };

  const requestDelete = (farm: Farm, event: MouseEvent) => {
    event.stopPropagation();
    setDeleteTarget(farm);
  };

  const confirmDelete = () => {
    if (!deleteTarget || deleting) return;
    void (async () => {
      setDeleting(true);
      try {
        const result = await deleteFarmAction(deleteTarget.id);
        if (!result.ok) {
          notifications.show({ color: "red", message: result.message });
          return;
        }
        notifications.show({ color: "green", message: `Đã xóa ${deleteTarget.name}` });
        setDeleteTarget(null);
        router.refresh();
      } finally {
        setDeleting(false);
      }
    })();
  };

  return (
    <Stack gap="lg" className={styles.page}>
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <PageHeader
          title="Trang trại"
          description="Bấm vào một trại để xem thiết bị IoT và trạng thái hoạt động."
        />
        <Button leftSection={<IconPlus size={16} />} color="capraBlue" onClick={open}>
          Thêm trang trại
        </Button>
      </Group>

      <ResponsiveDataView
        data={farms}
        getRowKey={(f) => f.id}
        onRowClick={openFarm}
        columns={[
          { key: "name", header: "Tên", render: (f) => f.name },
          { key: "owner", header: "Chủ trại", render: (f) => f.ownerEmail },
          { key: "location", header: "Khu vực", render: (f) => f.location },
          { key: "goats", header: "Đàn", render: (f) => String(f.goatCount) },
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
          {
            key: "actions",
            header: "",
            render: (f) => (
              <Group gap={4} wrap="nowrap" justify="flex-end">
                <IconChevronRight size={16} className={styles.rowHint} />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={`Xóa ${f.name}`}
                  onClick={(event) => requestDelete(f, event)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        mobileCard={(f) => (
          <Group justify="space-between" wrap="nowrap">
            <Stack gap={4}>
              <Text fw={700}>{f.name}</Text>
              <Text size="sm" c="dimmed">
                {f.location} · {f.ownerEmail}
              </Text>
            </Stack>
            <IconChevronRight size={18} className={styles.rowHint} />
          </Group>
        )}
      />

      <AdminCreateFarmModal
        opened={opened}
        onClose={close}
        onCreated={() => router.refresh()}
      />

      <ConfirmDialog
        opened={deleteTarget !== null}
        title="Xóa trang trại"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xóa "${deleteTarget.name}"? Thiết bị IoT và dữ liệu giám sát của trại sẽ bị xóa.`
            : ""
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </Stack>
  );
}

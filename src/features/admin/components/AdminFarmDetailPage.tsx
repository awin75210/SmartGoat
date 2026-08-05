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
import type { Barn } from "@/features/herd/types/barn.types";
import type { GoatBatch } from "@/features/herd/types/goat-batch.types";
import type { BreedingDoe } from "@/features/herd/types/breeding-doe.types";
import type { JournalEntry } from "@/features/herd/types/journal.types";
import { JOURNAL_ENTRY_TYPE_LABELS } from "@/features/herd/constants/journal.constants";
import { BREEDING_DOE_STATUS_LABELS } from "@/features/herd/constants/breeding-doe.constants";
import {
  BARN_STATUS_LABELS,
  GOAT_BATCH_GENDER_LABELS,
  GOAT_BATCH_SOURCE_LABELS,
  GOAT_BATCH_STATUS_LABELS,
  GOAT_BATCH_STATUSES,
} from "@/features/herd/constants/goat-batch.constants";
import { formatAgeVi, formatBirthDateVi } from "@/features/herd/utils/age.utils";
import styles from "./AdminFarmDetailPage.module.css";

const BATCH_STATUS_COLORS: Record<(typeof GOAT_BATCH_STATUSES)[number], string> = {
  active: "#40c057",
  sold: "#868e96",
  moved_out: "#fab005",
  closed: "#e8590c",
};

const DEVICE_STATUS: Record<Device["status"], { label: string; color: string }> = {
  online: { label: "Hoạt động", color: "#40c057" },
  offline: { label: "Ngắt kết nối", color: "#e8590c" },
  maintenance: { label: "Bảo trì", color: "#fab005" },
};

type AdminFarmDetailPageProps = {
  farm: Farm;
  devices: Device[];
  barns: Barn[];
  batches: GoatBatch[];
  does: BreedingDoe[];
  journal: JournalEntry[];
};

export function AdminFarmDetailPage({
  farm,
  devices,
  barns,
  batches,
  does,
  journal,
}: AdminFarmDetailPageProps) {
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
              Tổng đàn/lứa
            </Text>
            <Text fw={700}>
              {batches.reduce((sum, b) => sum + b.quantity, 0)} con · {batches.length} lứa
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Chuồng
            </Text>
            <Text fw={700}>{barns.length}</Text>
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

      <Stack gap="sm">
        <Text fw={700}>Chuồng nuôi</Text>
        <ResponsiveDataView
          data={barns}
          getRowKey={(b) => b.id}
          emptyState={
            <Text size="sm" c="dimmed">
              Trại chưa có chuồng nào.
            </Text>
          }
          columns={[
            { key: "name", header: "Tên chuồng", render: (b) => b.name },
            {
              key: "capacity",
              header: "Sức chứa",
              render: (b) => (b.capacity ? `${b.capacity} con` : "—"),
            },
            {
              key: "status",
              header: "Trạng thái",
              render: (b) => (
                <StatusBadge
                  label={BARN_STATUS_LABELS[b.status]}
                  color={b.status === "active" ? "#40c057" : "#868e96"}
                />
              ),
            },
          ]}
          mobileCard={(b) => (
            <Stack gap={4}>
              <Text fw={700}>{b.name}</Text>
              <Text size="sm" c="dimmed">
                {b.capacity ? `Sức chứa ~${b.capacity} con` : "Chưa cập nhật sức chứa"}
              </Text>
              <StatusBadge
                label={BARN_STATUS_LABELS[b.status]}
                color={b.status === "active" ? "#40c057" : "#868e96"}
              />
            </Stack>
          )}
        />
      </Stack>

      <Stack gap="sm">
        <Text fw={700}>Đàn / lứa</Text>
        <ResponsiveDataView
          data={batches}
          getRowKey={(b) => b.id}
          emptyState={
            <Text size="sm" c="dimmed">
              Trại chưa có đàn/lứa nào.
            </Text>
          }
          columns={[
            { key: "code", header: "Mã", render: (b) => b.batchCode },
            { key: "name", header: "Tên", render: (b) => b.name },
            {
              key: "barn",
              header: "Chuồng",
              render: (b) => barns.find((br) => br.id === b.barnId)?.name ?? "—",
            },
            { key: "breed", header: "Giống", render: (b) => b.breed },
            {
              key: "gender",
              header: "Giới tính",
              render: (b) => GOAT_BATCH_GENDER_LABELS[b.gender],
            },
            {
              key: "birth",
              header: "Ngày sinh",
              render: (b) => formatBirthDateVi(b.birthDate),
            },
            { key: "age", header: "Tuổi", render: (b) => formatAgeVi(b.birthDate) },
            { key: "qty", header: "Số lượng", render: (b) => String(b.quantity) },
            {
              key: "source",
              header: "Nguồn",
              render: (b) => GOAT_BATCH_SOURCE_LABELS[b.source],
            },
            {
              key: "status",
              header: "Trạng thái",
              render: (b) => (
                <StatusBadge
                  label={GOAT_BATCH_STATUS_LABELS[b.status]}
                  color={BATCH_STATUS_COLORS[b.status]}
                />
              ),
            },
          ]}
          mobileCard={(b) => (
            <Stack gap={4}>
              <Group justify="space-between">
                <Text fw={700}>{b.name}</Text>
                <Text size="xs" c="dimmed">
                  {b.batchCode}
                </Text>
              </Group>
              <StatusBadge
                label={GOAT_BATCH_STATUS_LABELS[b.status]}
                color={BATCH_STATUS_COLORS[b.status]}
              />
              <Text size="sm">
                {barns.find((br) => br.id === b.barnId)?.name ?? "—"} · {b.quantity} con
              </Text>
            </Stack>
          )}
        />
      </Stack>

      <Stack gap="md">
        <Text fw={700}>Dê sinh sản ({does.length})</Text>
        <ResponsiveDataView
          data={does}
          getRowKey={(d) => d.id}
          emptyState={<Text size="sm" c="dimmed">Chưa có dê sinh sản.</Text>}
          columns={[
            { key: "tag", header: "Mã", render: (d) => d.tagCode },
            { key: "name", header: "Tên", render: (d) => d.name },
            { key: "status", header: "Trạng thái", render: (d) => BREEDING_DOE_STATUS_LABELS[d.status] },
          ]}
          mobileCard={(d) => (
            <Text size="sm">
              {d.name} · {d.tagCode}
            </Text>
          )}
        />
      </Stack>

      <Stack gap="md">
        <Text fw={700}>Nhật ký ({journal.length})</Text>
        <ResponsiveDataView
          data={journal}
          getRowKey={(j) => j.id}
          emptyState={<Text size="sm" c="dimmed">Chưa có nhật ký.</Text>}
          columns={[
            { key: "date", header: "Thời gian", render: (j) => formatDateTimeVi(j.recordedAt) },
            { key: "type", header: "Loại", render: (j) => JOURNAL_ENTRY_TYPE_LABELS[j.entryType] },
            { key: "title", header: "Tiêu đề", render: (j) => j.title },
          ]}
          mobileCard={(j) => (
            <Text size="sm">
              {j.title} · {JOURNAL_ENTRY_TYPE_LABELS[j.entryType]}
            </Text>
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

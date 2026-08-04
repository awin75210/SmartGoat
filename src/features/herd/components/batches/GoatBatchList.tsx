"use client";

import { useMemo, useState } from "react";
import { Group, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import {
  GOAT_BATCH_GENDER_LABELS,
  GOAT_BATCH_SOURCE_LABELS,
  GOAT_BATCH_STATUS_LABELS,
  GOAT_BATCH_STATUSES,
} from "../../constants/goat-batch.constants";
import type { Barn } from "../../types/barn.types";
import type { GoatBatch, GoatBatchListFilter } from "../../types/goat-batch.types";
import { formatAgeVi, formatBirthDateVi } from "../../utils/age.utils";
import styles from "./GoatBatchList.module.css";

const STATUS_COLORS: Record<(typeof GOAT_BATCH_STATUSES)[number], string> = {
  active: "#40c057",
  sold: "#868e96",
  moved_out: "#fab005",
  closed: "#e8590c",
};

type GoatBatchListProps = {
  batches: GoatBatch[];
  barns: Barn[];
};

export function GoatBatchList({ batches, barns }: GoatBatchListProps) {
  const [filter, setFilter] = useState<GoatBatchListFilter>({
    search: "",
    status: "all",
    barnId: "all",
  });

  const barnMap = useMemo(
    () => new Map(barns.map((b) => [b.id, b.name])),
    [barns],
  );

  const filtered = useMemo(() => {
    let list = batches;
    if (filter.status && filter.status !== "all") {
      list = list.filter((b) => b.status === filter.status);
    }
    if (filter.barnId && filter.barnId !== "all") {
      list = list.filter((b) => b.barnId === filter.barnId);
    }
    if (filter.search?.trim()) {
      const q = filter.search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.batchCode.toLowerCase().includes(q) ||
          b.breed.toLowerCase().includes(q),
      );
    }
    return list;
  }, [batches, filter]);

  const barnOptions = [
    { value: "all", label: "Tất cả chuồng" },
    ...barns.map((b) => ({ value: b.id, label: b.name })),
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...GOAT_BATCH_STATUSES.map((s) => ({
      value: s,
      label: GOAT_BATCH_STATUS_LABELS[s],
    })),
  ];

  return (
    <Paper radius="lg" shadow="sm" p="lg">
      <Stack gap="md" className={styles.root}>
        <div>
          <Text fw={700}>Đàn / lứa</Text>
          <Text size="sm" c="dimmed">
            {batches.length} lứa — quản lý theo ngày sinh và số lượng
          </Text>
        </div>

        <Group grow preventGrowOverflow={false}>
          <TextInput
            label="Tìm kiếm"
            placeholder="Tên, mã đàn, giống..."
            value={filter.search ?? ""}
            onChange={(e) =>
              setFilter({ ...filter, search: e.currentTarget.value })
            }
          />
          <Select
            label="Chuồng"
            data={barnOptions}
            value={filter.barnId ?? "all"}
            onChange={(v) =>
              setFilter({ ...filter, barnId: (v as GoatBatchListFilter["barnId"]) ?? "all" })
            }
          />
          <Select
            label="Trạng thái"
            data={statusOptions}
            value={filter.status ?? "all"}
            onChange={(v) =>
              setFilter({ ...filter, status: (v as GoatBatchListFilter["status"]) ?? "all" })
            }
          />
        </Group>

        <ResponsiveDataView
          data={filtered}
          getRowKey={(b) => b.id}
          emptyState={
            <Text size="sm" c="dimmed">
              Chưa có đàn/lứa nào. Tạo chuồng rồi bấm 「Thêm đàn」 để bắt đầu.
            </Text>
          }
          columns={[
            { key: "code", header: "Mã", render: (b) => b.batchCode },
            { key: "name", header: "Tên đàn", render: (b) => <Text fw={600}>{b.name}</Text> },
            {
              key: "barn",
              header: "Chuồng",
              render: (b) => barnMap.get(b.barnId) ?? b.barnName ?? "—",
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
            {
              key: "age",
              header: "Tuổi",
              render: (b) => formatAgeVi(b.birthDate),
            },
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
                  color={STATUS_COLORS[b.status]}
                />
              ),
            },
          ]}
          mobileCard={(b) => (
            <Stack gap={4}>
              <Group justify="space-between" wrap="nowrap">
                <Text fw={700}>{b.name}</Text>
                <Text size="xs" c="dimmed">
                  {b.batchCode}
                </Text>
              </Group>
              <StatusBadge
                label={GOAT_BATCH_STATUS_LABELS[b.status]}
                color={STATUS_COLORS[b.status]}
              />
              <Text size="sm">
                {barnMap.get(b.barnId) ?? "—"} · {b.quantity} con · {formatAgeVi(b.birthDate)}
              </Text>
              <Text size="xs" c="dimmed">
                {GOAT_BATCH_GENDER_LABELS[b.gender]} · {b.breed} ·{" "}
                {GOAT_BATCH_SOURCE_LABELS[b.source]}
              </Text>
            </Stack>
          )}
        />
      </Stack>
    </Paper>
  );
}

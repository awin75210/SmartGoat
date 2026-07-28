"use client";

import Link from "next/link";
import { Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { GOAT_GENDER_LABELS, GOAT_HEALTH_LABELS } from "@/shared/constants/goat-status";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { GOAT_HEALTH_COLORS } from "@/shared/constants/goat-status";
import type { Goat, HerdListFilter } from "../types/herd.types";
import styles from "./HerdList.module.css";

type HerdListProps = {
  goats: Goat[];
  filter: HerdListFilter;
  onFilterChange: (filter: HerdListFilter) => void;
};

export function HerdList({ goats, filter, onFilterChange }: HerdListProps) {
  return (
    <Stack gap="md" className={styles.root}>
      <Group grow preventGrowOverflow={false}>
        <TextInput
          placeholder="Tìm theo tên, mã thẻ..."
          value={filter.search ?? ""}
          onChange={(e) => onFilterChange({ ...filter, search: e.currentTarget.value })}
        />
        <Select
          label="Giới tính"
          data={[
            { value: "all", label: "Tất cả" },
            { value: "male", label: GOAT_GENDER_LABELS.male },
            { value: "female", label: GOAT_GENDER_LABELS.female },
          ]}
          value={filter.gender ?? "all"}
          onChange={(v) =>
            onFilterChange({ ...filter, gender: (v as HerdListFilter["gender"]) ?? "all" })
          }
        />
        <Select
          label="Sức khỏe"
          data={[
            { value: "all", label: "Tất cả" },
            ...Object.entries(GOAT_HEALTH_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          value={filter.healthStatus ?? "all"}
          onChange={(v) =>
            onFilterChange({
              ...filter,
              healthStatus: (v as HerdListFilter["healthStatus"]) ?? "all",
            })
          }
        />
      </Group>
      <ResponsiveDataView
        data={goats}
        getRowKey={(g) => g.id}
        columns={[
          { key: "tag", header: "Mã", render: (g) => g.tagCode },
          {
            key: "name",
            header: "Tên",
            render: (g) => (
              <Text component={Link} href={`/app/herd/${g.id}`} fw={600} className={styles.link}>
                {g.name}
              </Text>
            ),
          },
          { key: "breed", header: "Giống", render: (g) => g.breed },
          {
            key: "gender",
            header: "Giới tính",
            render: (g) => GOAT_GENDER_LABELS[g.gender],
          },
          {
            key: "health",
            header: "Sức khỏe",
            render: (g) => (
              <StatusBadge
                label={GOAT_HEALTH_LABELS[g.healthStatus]}
                color={GOAT_HEALTH_COLORS[g.healthStatus]}
              />
            ),
          },
          { key: "weight", header: "Cân nặng", render: (g) => `${g.weightKg} kg` },
        ]}
        mobileCard={(g) => (
          <Stack gap={4}>
            <Group justify="space-between">
              <Text fw={700} component={Link} href={`/app/herd/${g.id}`}>
                {g.name}
              </Text>
              <Text size="xs" c="dimmed">
                {g.tagCode}
              </Text>
            </Group>
            <StatusBadge
              label={GOAT_HEALTH_LABELS[g.healthStatus]}
              color={GOAT_HEALTH_COLORS[g.healthStatus]}
            />
            <Text size="sm">
              {GOAT_GENDER_LABELS[g.gender]} · {g.weightKg} kg
            </Text>
          </Stack>
        )}
      />
    </Stack>
  );
}

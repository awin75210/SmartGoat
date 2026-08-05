"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { ResponsiveDataView } from "@/shared/components/ResponsiveDataView/ResponsiveDataView";
import {
  BREEDING_DOE_STATUS_LABELS,
  BREEDING_DOE_STATUSES,
} from "../../constants/breeding-doe.constants";
import { formatBirthDateVi, formatAgeVi } from "../../utils/age.utils";
import { formatDateVi } from "../../utils/stage.utils";
import type { BreedingDoe } from "../../types/breeding-doe.types";

const STATUS_COLORS: Record<(typeof BREEDING_DOE_STATUSES)[number], string> = {
  active: "#40c057",
  pregnant: "#7950f2",
  lactating: "#228be6",
  retired: "#868e96",
  sold: "#fab005",
};

type BreedingDoeListProps = {
  does: BreedingDoe[];
  readOnly?: boolean;
};

export function BreedingDoeList({ does, readOnly = false }: BreedingDoeListProps) {
  const router = useRouter();

  return (
    <Paper radius="lg" shadow="sm" p="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Text fw={700}>Dê cái sinh sản</Text>
            <Text size="sm" c="dimmed">
              Hồ sơ riêng kèm mã vạch in tem
            </Text>
          </div>
          {!readOnly ? (
            <Button
              component={Link}
              href="/app/herd/breeding/new"
              size="sm"
              leftSection={<IconPlus size={14} />}
            >
              Thêm dê
            </Button>
          ) : null}
        </Group>

        <ResponsiveDataView
          data={does}
          getRowKey={(d) => d.id}
          onRowClick={(d) => router.push(`/app/herd/breeding/${d.id}`)}
          emptyState={
            <Text size="sm" c="dimmed">
              Chưa có dê sinh sản. Bấm 「Thêm dê」 để tạo hồ sơ và in tem mã vạch.
            </Text>
          }
          columns={[
            { key: "tag", header: "Mã", render: (d) => d.tagCode },
            { key: "name", header: "Tên", render: (d) => <Text fw={600}>{d.name}</Text> },
            { key: "breed", header: "Giống", render: (d) => d.breed },
            {
              key: "birth",
              header: "Ngày sinh",
              render: (d) => formatBirthDateVi(d.birthDate),
            },
            { key: "age", header: "Tuổi", render: (d) => formatAgeVi(d.birthDate) },
            {
              key: "status",
              header: "Trạng thái",
              render: (d) => (
                <StatusBadge
                  label={BREEDING_DOE_STATUS_LABELS[d.status]}
                  color={STATUS_COLORS[d.status]}
                />
              ),
            },
            {
              key: "kidding",
              header: "Dự kiến đẻ",
              render: (d) =>
                d.expectedKiddingDate ? formatDateVi(d.expectedKiddingDate) : "—",
            },
          ]}
          mobileCard={(d) => (
            <Stack gap={4}>
              <Group justify="space-between">
                <Text fw={700}>{d.name}</Text>
                <Text size="xs" c="dimmed">
                  {d.tagCode}
                </Text>
              </Group>
              <StatusBadge
                label={BREEDING_DOE_STATUS_LABELS[d.status]}
                color={STATUS_COLORS[d.status]}
              />
              <Text size="sm">
                {d.breed} · {formatAgeVi(d.birthDate)}
              </Text>
              {d.expectedKiddingDate ? (
                <Text size="xs" c="violet">
                  Dự kiến đẻ: {formatDateVi(d.expectedKiddingDate)}
                </Text>
              ) : null}
            </Stack>
          )}
        />
      </Stack>
    </Paper>
  );
}

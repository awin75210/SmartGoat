"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, SimpleGrid, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import type { Barn } from "../types/barn.types";
import type { GoatBatch, HerdOverviewStats } from "../types/goat-batch.types";
import { BarnList } from "./barns/BarnList";
import { GoatBatchList } from "./batches/GoatBatchList";

type HerdPageProps = {
  barns: Barn[];
  batches: GoatBatch[];
  stats: HerdOverviewStats;
  readOnly?: boolean;
};

export function HerdPage({ barns, batches, stats, readOnly = false }: HerdPageProps) {
  const router = useRouter();

  return (
    <Stack gap="lg">
      <PageHeader
        title="Đàn dê"
        description="Quản lý chuồng và đàn/lứa theo ngày sinh, số lượng"
        actions={
          !readOnly ? (
            <Button
              component={Link}
              href="/app/herd/new"
              leftSection={<IconPlus size={16} />}
              disabled={barns.length === 0}
            >
              Thêm đàn
            </Button>
          ) : undefined
        }
      />
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
        <MetricCardShell label="Tổng số lượng" value={String(stats.totalQuantity)} />
        <MetricCardShell label="Đang nuôi" value={String(stats.activeQuantity)} />
        <MetricCardShell label="Lứa active" value={String(stats.activeBatchCount)} />
        <MetricCardShell label="Chuồng" value={String(stats.barnCount)} />
        <MetricCardShell label="Lứa đực" value={String(stats.maleBatchCount)} />
        <MetricCardShell label="Lứa cái" value={String(stats.femaleBatchCount)} />
      </SimpleGrid>
      <BarnList
        barns={barns}
        batches={batches}
        readOnly={readOnly}
        onChanged={() => router.refresh()}
      />
      <GoatBatchList batches={batches} barns={barns} />
    </Stack>
  );
}

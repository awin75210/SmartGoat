"use client";

import { useMemo, useState } from "react";
import { SimpleGrid, Stack } from "@mantine/core";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import type { Goat, HerdListFilter, HerdOverviewStats } from "../types/herd.types";
import { HerdList } from "./HerdList";

type HerdPageProps = {
  goats: Goat[];
  stats: HerdOverviewStats;
};

export function HerdPage({ goats, stats }: HerdPageProps) {
  const [filter, setFilter] = useState<HerdListFilter>({
    gender: "all",
    healthStatus: "all",
    search: "",
  });

  const filtered = useMemo(() => {
    let list = goats;
    if (filter.gender && filter.gender !== "all") {
      list = list.filter((g) => g.gender === filter.gender);
    }
    if (filter.healthStatus && filter.healthStatus !== "all") {
      list = list.filter((g) => g.healthStatus === filter.healthStatus);
    }
    if (filter.search?.trim()) {
      const q = filter.search.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.tagCode.toLowerCase().includes(q) ||
          g.breed.toLowerCase().includes(q),
      );
    }
    return list;
  }, [goats, filter]);

  return (
    <Stack gap="lg">
      <PageHeader title="Đàn dê" description="Quản lý hồ sơ và sức khỏe từng con" />
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
        <MetricCardShell label="Tổng số" value={String(stats.totalGoats)} />
        <MetricCardShell label="Đực" value={String(stats.maleCount)} />
        <MetricCardShell label="Cái" value={String(stats.femaleCount)} />
        <MetricCardShell label="Dê con" value={String(stats.kidCount)} />
        <MetricCardShell label="Mang thai" value={String(stats.pregnantCount)} />
        <MetricCardShell label="Theo dõi" value={String(stats.monitoringCount)} />
      </SimpleGrid>
      <HerdList goats={filtered} filter={filter} onFilterChange={setFilter} />
    </Stack>
  );
}

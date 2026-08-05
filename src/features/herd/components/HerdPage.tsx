"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Group, SimpleGrid, Stack, Tabs, Text } from "@mantine/core";
import { IconDownload, IconPlus, IconSearch } from "@tabler/icons-react";
import { MetricCardShell } from "@/shared/components/MetricCardShell/MetricCardShell";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { downloadCsv } from "@/shared/utils/download-csv";
import { exportBatchesCsvAction } from "../actions/herd-extended.actions";
import type { Barn } from "../types/barn.types";
import type { GoatBatch, HerdOverviewStats } from "../types/goat-batch.types";
import type { BreedingDoe } from "../types/breeding-doe.types";
import type { JournalEntry } from "../types/journal.types";
import type { CareReminder } from "../types/care.types";
import { BarnList } from "./barns/BarnList";
import { GoatBatchList } from "./batches/GoatBatchList";
import { BreedingDoeList } from "./breeding/BreedingDoeList";
import { JournalPanel } from "./journal/JournalPanel";
import { CareReminderPanel } from "./reminders/CareReminderPanel";

type HerdPageProps = {
  barns: Barn[];
  batches: GoatBatch[];
  stats: HerdOverviewStats;
  does: BreedingDoe[];
  journal: JournalEntry[];
  reminders: CareReminder[];
  readOnly?: boolean;
};

export function HerdPage({
  barns,
  batches,
  stats,
  does,
  journal,
  reminders,
  readOnly = false,
}: HerdPageProps) {
  const router = useRouter();

  const handleExportBatches = () => {
    void (async () => {
      const result = await exportBatchesCsvAction();
      if (result.ok) downloadCsv(result.data.csv, result.data.filename);
    })();
  };

  return (
    <Stack gap="lg">
      <PageHeader
        title="Đàn & Nhật ký"
        description="Quản lý lứa, dê sinh sản, nhật ký và lịch chăm sóc"
        actions={
          !readOnly ? (
            <Group>
              <Button
                component={Link}
                href="/app/herd/trace"
                variant="light"
                leftSection={<IconSearch size={16} />}
              >
                Truy xuất
              </Button>
              <Button variant="light" leftSection={<IconDownload size={16} />} onClick={handleExportBatches}>
                Xuất CSV
              </Button>
              <Button
                component={Link}
                href="/app/herd/new"
                leftSection={<IconPlus size={16} />}
                disabled={barns.length === 0}
              >
                Thêm đàn
              </Button>
            </Group>
          ) : undefined
        }
      />
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
        <MetricCardShell label="Tổng số lượng" value={String(stats.totalQuantity)} />
        <MetricCardShell label="Đang nuôi" value={String(stats.activeQuantity)} />
        <MetricCardShell label="Lứa active" value={String(stats.activeBatchCount)} />
        <MetricCardShell label="Chuồng" value={String(stats.barnCount)} />
        <MetricCardShell label="Dê sinh sản" value={String(stats.breedingDoeCount ?? 0)} />
        <MetricCardShell label="Nhắc chăm sóc" value={String(stats.pendingReminderCount ?? 0)} />
      </SimpleGrid>

      <Tabs defaultValue="batches">
        <Tabs.List>
          <Tabs.Tab value="batches">Lứa đàn</Tabs.Tab>
          <Tabs.Tab value="breeding">Dê sinh sản</Tabs.Tab>
          <Tabs.Tab value="journal">Nhật ký</Tabs.Tab>
          <Tabs.Tab value="reminders">Lịch nhắc</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="batches" pt="md">
          <Stack gap="lg">
            <BarnList
              barns={barns}
              batches={batches}
              readOnly={readOnly}
              onChanged={() => router.refresh()}
            />
            <GoatBatchList batches={batches} barns={barns} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="breeding" pt="md">
          <BreedingDoeList does={does} readOnly={readOnly} />
        </Tabs.Panel>

        <Tabs.Panel value="journal" pt="md">
          <JournalPanel
            entries={journal}
            batches={batches}
            does={does}
            readOnly={readOnly}
          />
        </Tabs.Panel>

        <Tabs.Panel value="reminders" pt="md">
          <CareReminderPanel reminders={reminders} readOnly={readOnly} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

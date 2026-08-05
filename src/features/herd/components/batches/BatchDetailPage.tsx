"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { downloadCsv } from "@/shared/utils/download-csv";
import {
  exportTraceabilityCsvAction,
  updateGoatBatchAction,
} from "../../actions/herd-extended.actions";
import {
  GOAT_BATCH_GENDER_LABELS,
  GOAT_BATCH_SOURCE_LABELS,
  GOAT_BATCH_STATUS_LABELS,
  GOAT_BATCH_STATUSES,
  GOAT_BATCH_SOURCES,
  GOAT_BATCH_GENDERS,
} from "../../constants/goat-batch.constants";
import {
  DEVELOPMENT_STAGE_LABELS,
  DEVELOPMENT_STAGES,
} from "../../constants/development-stage.constants";
import { formatBirthDateVi, formatAgeVi } from "../../utils/age.utils";
import type { Barn } from "../../types/barn.types";
import type { GoatBatch } from "../../types/goat-batch.types";
import type { JournalEntry } from "../../types/journal.types";
import type { CareReminder } from "../../types/care.types";
import type { GrowthRecord } from "../../types/growth.types";
import type { GrowthProjection } from "../../utils/growth-projection.utils";
import { JournalPanel } from "../journal/JournalPanel";
import { CareReminderPanel } from "../reminders/CareReminderPanel";
import { GrowthPanel } from "../growth/GrowthPanel";

type BatchDetailPageProps = {
  batch: GoatBatch;
  barns: Barn[];
  journal: JournalEntry[];
  reminders: CareReminder[];
  growthRecords: GrowthRecord[];
  projection: GrowthProjection | null;
  readOnly?: boolean;
};

export function BatchDetailPage({
  batch,
  barns,
  journal,
  reminders,
  growthRecords,
  projection,
  readOnly = false,
}: BatchDetailPageProps) {
  const router = useRouter();
  const [name, setName] = useState(batch.name);
  const [barnId, setBarnId] = useState(batch.barnId);
  const [breed, setBreed] = useState(batch.breed);
  const [gender, setGender] = useState(batch.gender);
  const [quantity, setQuantity] = useState(batch.quantity);
  const [source, setSource] = useState(batch.source);
  const [status, setStatus] = useState(batch.status);
  const [stageOverride, setStageOverride] = useState(batch.stageOverride);
  const [developmentStage, setDevelopmentStage] = useState(batch.developmentStage);
  const [supplierInfo, setSupplierInfo] = useState(batch.supplierInfo ?? "");
  const [notes, setNotes] = useState(batch.notes ?? "");
  const [pending, setPending] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = () => {
    void (async () => {
      setPending(true);
      try {
        const result = await updateGoatBatchAction(batch.id, {
          name,
          barn_id: barnId,
          breed,
          gender,
          quantity,
          source,
          status,
          stage_override: stageOverride,
          development_stage: developmentStage,
          supplier_info: supplierInfo || null,
          notes: notes || null,
        });
        if (result.ok) router.refresh();
      } finally {
        setPending(false);
      }
    })();
  };

  const handleExport = () => {
    void (async () => {
      setExporting(true);
      try {
        const result = await exportTraceabilityCsvAction(batch.id);
        if (result.ok) downloadCsv(result.data.csv, result.data.filename);
      } finally {
        setExporting(false);
      }
    })();
  };

  return (
    <Stack gap="lg">
      <PageHeader
        title={batch.name}
        description={`${batch.batchCode} · ${formatAgeVi(batch.birthDate)} · ${batch.quantity} con`}
        actions={
          <Group>
            <Button component={Link} href={`/app/herd/trace?code=${batch.batchCode}`} variant="light">
              Truy xuất
            </Button>
            <Button variant="light" loading={exporting} onClick={handleExport}>
              Xuất CSV
            </Button>
          </Group>
        }
      />

      <Paper withBorder radius="md" p="md">
        <Group justify="space-between" mb="sm">
          <StatusBadge
            label={DEVELOPMENT_STAGE_LABELS[batch.effectiveStage]}
            color="#228be6"
          />
          <StatusBadge
            label={GOAT_BATCH_STATUS_LABELS[batch.status]}
            color="#40c057"
          />
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Text size="sm">Giống: {batch.breed}</Text>
          <Text size="sm">Giới tính: {GOAT_BATCH_GENDER_LABELS[batch.gender]}</Text>
          <Text size="sm">Nguồn: {GOAT_BATCH_SOURCE_LABELS[batch.source]}</Text>
          <Text size="sm">Ngày sinh: {formatBirthDateVi(batch.birthDate)}</Text>
          <Text size="sm">Chuồng: {batch.barnName ?? batch.barnId}</Text>
          {batch.supplierInfo ? (
            <Text size="sm">NCC: {batch.supplierInfo}</Text>
          ) : null}
        </SimpleGrid>
      </Paper>

      <Tabs defaultValue="info">
        <Tabs.List>
          <Tabs.Tab value="info">Thông tin</Tabs.Tab>
          <Tabs.Tab value="journal">Nhật ký</Tabs.Tab>
          <Tabs.Tab value="growth">Tăng trưởng</Tabs.Tab>
          <Tabs.Tab value="reminders">Lịch nhắc</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="info" pt="md">
          {!readOnly ? (
            <Paper withBorder radius="md" p="md">
              <Title order={5} mb="md">
                Sửa thông tin lứa
              </Title>
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                <TextInput label="Tên đàn" value={name} onChange={(e) => setName(e.currentTarget.value)} />
                <Select
                  label="Chuồng"
                  data={barns.map((b) => ({ value: b.id, label: b.name }))}
                  value={barnId}
                  onChange={(v) => setBarnId(v ?? batch.barnId)}
                />
                <TextInput label="Giống" value={breed} onChange={(e) => setBreed(e.currentTarget.value)} />
                <Select
                  label="Giới tính"
                  data={GOAT_BATCH_GENDERS.map((g) => ({
                    value: g,
                    label: GOAT_BATCH_GENDER_LABELS[g],
                  }))}
                  value={gender}
                  onChange={(v) => setGender(v as typeof gender)}
                />
                <NumberInput label="Số lượng" min={1} value={quantity} onChange={(v) => setQuantity(Number(v) || 1)} />
                <Select
                  label="Nguồn gốc"
                  data={GOAT_BATCH_SOURCES.map((s) => ({
                    value: s,
                    label: GOAT_BATCH_SOURCE_LABELS[s],
                  }))}
                  value={source}
                  onChange={(v) => setSource(v as typeof source)}
                />
                <Select
                  label="Trạng thái"
                  data={GOAT_BATCH_STATUSES.map((s) => ({
                    value: s,
                    label: GOAT_BATCH_STATUS_LABELS[s],
                  }))}
                  value={status}
                  onChange={(v) => setStatus(v as typeof status)}
                />
                <Checkbox
                  label="Ghi đè giai đoạn tự động"
                  checked={stageOverride}
                  onChange={(e) => setStageOverride(e.currentTarget.checked)}
                />
                {stageOverride ? (
                  <Select
                    label="Giai đoạn"
                    data={DEVELOPMENT_STAGES.map((s) => ({
                      value: s,
                      label: DEVELOPMENT_STAGE_LABELS[s],
                    }))}
                    value={developmentStage}
                    onChange={(v) => setDevelopmentStage(v as typeof developmentStage)}
                  />
                ) : null}
                <TextInput
                  label="Thông tin nguồn / NCC"
                  value={supplierInfo}
                  onChange={(e) => setSupplierInfo(e.currentTarget.value)}
                />
              </SimpleGrid>
              <Textarea mt="md" label="Ghi chú" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => router.push("/app/herd")}>
                  Quay lại
                </Button>
                <Button loading={pending} onClick={handleSave}>
                  Lưu thay đổi
                </Button>
              </Group>
            </Paper>
          ) : (
            <Button variant="default" onClick={() => router.push("/app/herd")}>
              Quay lại
            </Button>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="journal" pt="md">
          <JournalPanel
            entries={journal}
            batches={[batch]}
            does={[]}
            readOnly={readOnly}
            defaultBatchId={batch.id}
          />
        </Tabs.Panel>

        <Tabs.Panel value="growth" pt="md">
          <GrowthPanel
            batchId={batch.id}
            records={growthRecords}
            projection={projection}
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

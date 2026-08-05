"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Paper, Stack, Text, TextInput, Timeline, Title } from "@mantine/core";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { downloadCsv } from "@/shared/utils/download-csv";
import { exportTraceabilityCsvAction } from "../../actions/herd-extended.actions";
import { DEVELOPMENT_STAGE_LABELS } from "../../constants/development-stage.constants";
import { formatBirthDateVi } from "../../utils/age.utils";
import { formatDateVi } from "../../utils/stage.utils";
import type { GoatBatch } from "../../types/goat-batch.types";
import type { TraceabilityReport } from "../../types/care.types";

type TraceabilityPageProps = {
  initialCode?: string;
  batch: GoatBatch | null;
  report: TraceabilityReport | null;
};

export function TraceabilityPage({ initialCode = "", batch, report }: TraceabilityPageProps) {
  const [code, setCode] = useState(initialCode);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!batch) return;
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
        title="Truy xuất nguồn gốc"
        description="Tra cứu timeline lứa đàn theo mã GOAT-..."
      />
      <Paper withBorder radius="md" p="md">
        <form action="/app/herd/trace" method="get">
          <Stack gap="sm">
            <TextInput
              name="code"
              label="Mã lứa"
              placeholder="GOAT-202508-001"
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
            />
            <Button type="submit">Tra cứu</Button>
          </Stack>
        </form>
      </Paper>

      {batch && report ? (
        <Stack gap="md">
          <Paper withBorder radius="md" p="md">
            <Title order={4} mb="sm">
              {report.batchName} ({report.batchCode})
            </Title>
            <Stack gap={4}>
              <Text size="sm">Giống: {report.breed}</Text>
              <Text size="sm">Nguồn: {report.source}</Text>
              {report.supplierInfo ? <Text size="sm">NCC: {report.supplierInfo}</Text> : null}
              <Text size="sm">Chuồng: {report.barnName}</Text>
              <Text size="sm">Ngày sinh: {formatBirthDateVi(report.birthDate)}</Text>
              <Text size="sm">Số lượng: {report.quantity} con</Text>
              <Text size="sm">
                Giai đoạn: {DEVELOPMENT_STAGE_LABELS[batch.effectiveStage]}
              </Text>
            </Stack>
            <Stack gap="xs" mt="md">
              <Button component={Link} href={`/app/herd/batches/${batch.id}`} variant="light">
                Xem chi tiết lứa
              </Button>
              <Button variant="subtle" loading={exporting} onClick={handleExport}>
                Tải CSV truy xuất
              </Button>
            </Stack>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Title order={5} mb="md">
              Timeline
            </Title>
            <Timeline active={report.journal.length - 1}>
              {report.journal.map((j, i) => (
                <Timeline.Item key={`${j.date}-${i}`} title={j.title}>
                  <Text size="sm">
                    {formatDateVi(j.date)} · {j.type}
                  </Text>
                </Timeline.Item>
              ))}
              {report.growth.map((g, i) => (
                <Timeline.Item key={`g-${g.date}-${i}`} title={`Cân nặng TB ${g.weightKg} kg`}>
                  <Text size="sm">{formatDateVi(g.date)}</Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Paper>
        </Stack>
      ) : initialCode ? (
        <Text c="dimmed">Không tìm thấy lứa với mã {initialCode}</Text>
      ) : null}
    </Stack>
  );
}
